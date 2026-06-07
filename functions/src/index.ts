// functions/src/index.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { google } from 'googleapis';

initializeApp();

interface FormDocument {
	location: string;
	// citizenId: string;
	prefix: string;
	firstname: string;
	lastname: string;
	// signature: string;
	email?: string; 
    phone?: string;
}

interface SubmitRequest {
	document: FormDocument;
	turnstileToken: string;
}

interface TurnstileVerifyResponse {
	success: boolean;
	'error-codes'?: string[];
}

async function verifyTurnstileToken(
	token: string,
	secretKey: string,
	ip?: string,
): Promise<boolean> {
	const formData = new URLSearchParams();
	formData.append('secret', secretKey);
	formData.append('response', token);
	if (ip) formData.append('remoteip', ip);

	const res = await fetch(
		'https://challenges.cloudflare.com/turnstile/v0/siteverify',
		{
			method: 'POST',
			body: formData,
		},
	);

	const data: TurnstileVerifyResponse = await res.json();
	return data.success;
}

function assertAdmin(request: { auth?: { token: { email?: string } } }) {
	const adminEmail = process.env.ADMIN_EMAIL;
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'Authentication is required.');
	}
	if (!adminEmail || request.auth.token.email !== adminEmail) {
		throw new HttpsError('permission-denied', 'Admin access required.');
	}
}

export const submitDocument = onCall(async (request) => {
	const { document, turnstileToken } = request.data as SubmitRequest;

	if (!turnstileToken) {
		throw new HttpsError('invalid-argument', 'Turnstile token is required.');
	}

	const secretKey = process.env.TURNSTILE_SECRET_KEY;
	if (!secretKey) {
		throw new HttpsError('internal', 'Turnstile secret key is not configured.');
	}

	const isValid = await verifyTurnstileToken(
		turnstileToken,
		secretKey,
		request.rawRequest.ip,
	);

	if (!isValid) {
		throw new HttpsError('permission-denied', 'Turnstile verification failed.');
	}

	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'Authentication is required.');
	}

	const uid = request.auth.uid;
	const firestore = getFirestore();
	const batch = firestore.batch();

	const docRef = firestore.collection('documents').doc();
	const userRef = firestore.collection('users').doc(uid);

	batch.set(docRef, {
		...document,
		uid,
		timestamp: FieldValue.serverTimestamp(),
	});

	batch.set(
		userRef,
		{ timestamp: FieldValue.serverTimestamp() },
		{ merge: true },
	);

	await batch.commit();

	return { success: true };
});

export const countDocuments = onCall(async () => {
	const firestore = getFirestore();
	const snapshot = await firestore.collection('documents').count().get();
	return { count: snapshot.data().count };
});

export const listDocuments = onCall(async (request) => {
	assertAdmin(request);

	const { pageLimit } = request.data as {
		pageLimit: number;
	};

	const firestore = getFirestore();
    // ปรับเปลี่ยนการเรียงลำดับ
	let q: FirebaseFirestore.Query = firestore
		.collection('documents')
		.orderBy('timestamp', 'desc') 
		.limit(pageLimit);

	const snapshot = await q.get();
	const documents = snapshot.docs.map((doc) => doc.data());

	return { documents };
});

export const syncToGoogleSheets = onCall(async (request) => {
    // 1. ตรวจสอบสิทธิ์ (ต้องเป็นแอดมินเท่านั้นถึงกดส่งได้)
    assertAdmin(request);

    const firestore = getFirestore();
    const snapshot = await firestore.collection('documents').get();

    // 2. คัดกรองชื่อซ้ำ (ใช้ ชื่อ+นามสกุล เป็นคีย์)
    const uniqueRecords = new Map();
    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const key = `${data.firstname}${data.lastname}`.trim();
        if (!uniqueRecords.has(key)) {
            uniqueRecords.set(key, data);
        }
    });

    // 3. เตรียมข้อมูลเป็นแถวๆ สำหรับลงตาราง
    const rows = [['คำนำหน้า', 'ชื่อ', 'นามสกุล', 'อีเมล', 'เบอร์โทรศัพท์', 'จังหวัด']]; // หัวข้อตาราง
    uniqueRecords.forEach((data) => {
        rows.push([
            data.prefix || '',
            data.firstname || '',
            data.lastname || '',
            data.email || '',
            data.phone || '',
            data.location || ''
        ]);
    });

    // 4. ล็อกอินเข้า Google Sheets
    const auth = new google.auth.GoogleAuth({
        keyFile: './google-credentials.json', // ชื่อไฟล์ JSON ที่เราวางไว้
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1sGEa0Kgv5aurSBxucCsyWD9AtQ8F5tmxbvoR9gLM224'; 

    // 5. สั่งลบข้อมูลเก่าทิ้งทั้งหมด แล้วเขียนของใหม่ทับลงไป
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'Sheet1' });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: { values: rows }
    });

    return { success: true, totalExported: uniqueRecords.size };
});