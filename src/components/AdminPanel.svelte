<script lang="ts">
    import { onMount } from 'svelte';
    import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
    import { getFunctions, httpsCallable } from 'firebase/functions';
    // นำเข้าฟังก์ชันดึงแอปของ Firebase
    import { getApp } from 'firebase/app';
    
    // สั่งรันไฟล์ firebase.ts เพื่อให้ระบบเชื่อมต่อเบื้องหลังให้เสร็จ
    import '../utils/firebase'; 

    // ดึงตัวแอปที่เชื่อมต่อแล้วมาใช้งาน
    const app = getApp();
    const auth = getAuth(app);
    const functions = getFunctions(app);

    let user: any = null;
    let email = '';
    let password = '';
    let loginError = '';

    let documents: any[] = [];
    let isLoadingDocs = false;

    let isSyncing = false;
    let syncMessage = '';

    // เช็กสถานะว่าล็อกอินอยู่หรือไม่
    onMount(() => {
    onAuthStateChanged(auth, (currentUser) => {
        // เช็กว่าล็อกอินอยู่ และต้อง "ไม่ใช่การล็อกอินแบบไร้ตัวตน" (isAnonymous ต้องเป็น false)
        if (currentUser && !currentUser.isAnonymous) {
            user = currentUser;
            fetchDocuments(); 
        } else {
            // ถ้าเป็นบัญชีไร้ตัวตนหลงเข้ามา ให้เตะออกไปหน้ากรอกรหัสผ่านแอดมิน
            user = null;
            documents = [];
        }
    });
    });

    // ฟังก์ชันล็อกอิน
    async function login() {
        loginError = '';
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e) {
            loginError = 'ล็อกอินไม่สำเร็จ โปรดตรวจสอบอีเมลและรหัสผ่าน';
        }
    }

    // ฟังก์ชันออกจากระบบ
    async function logout() {
        await signOut(auth);
    }

    // ฟังก์ชันดึงข้อมูลมาแสดงในตาราง (ใช้ listDocuments ที่มีอยู่แล้วในหลังบ้าน)
    async function fetchDocuments() {
        isLoadingDocs = true;
        try {
            const listDocs = httpsCallable(functions, 'listDocuments');
            // ส่ง pageLimit ไปตามที่โค้ดหลังบ้านต้องการ
            const result = await listDocs({ pageLimit: 1000 }); 
            documents = (result.data as any).documents;
        } catch (e) {
            console.error("ดึงข้อมูลไม่สำเร็จ:", e);
        }
        isLoadingDocs = false;
    }

    // ฟังก์ชันซิงค์ Google Sheets
    async function handleSync() {
        isSyncing = true;
        syncMessage = "กำลังประมวลผลและส่งข้อมูล...";
        try {
            const syncData = httpsCallable(functions, 'syncToGoogleSheets'); 
            const result = await syncData();
            syncMessage = `อัปเดตสำเร็จ! ส่งข้อมูลไปทั้งหมด ${(result.data as any).totalExported} รายการ`;
        } catch (error) {
            console.error(error);
            syncMessage = "เกิดข้อผิดพลาด: คุณอาจจะไม่มีสิทธิ์แอดมิน หรือตั้งค่าผิดพลาด";
        }
        isSyncing = false;
    }
</script>

<div class="p-4 bg-base-100 rounded-lg shadow-md w-full">
    {#if !user}
        <div class="max-w-sm mx-auto bg-base-200 p-6 rounded-lg">
            <h3 class="font-bold text-xl mb-4 text-center">เข้าสู่ระบบแอดมิน</h3>
            <div class="form-control mb-2">
                <input type="email" bind:value={email} placeholder="อีเมล (admin@wevis.info)" class="input input-bordered w-full" />
            </div>
            <div class="form-control mb-4">
                <input type="password" bind:value={password} placeholder="รหัสผ่าน" class="input input-bordered w-full" />
            </div>
            {#if loginError}
                <p class="text-error text-sm mb-2">{loginError}</p>
            {/if}
            <button class="btn btn-primary w-full" on:click={login}>เข้าสู่ระบบ</button>
        </div>
    {:else}
        <div class="flex justify-between items-center mb-6">
            <div>
                <p class="text-sm text-gray-500">ลงชื่อเข้าใช้ในชื่อ: {user.email}</p>
                <button class="btn btn-xs btn-outline btn-error mt-1" on:click={logout}>ออกจากระบบ</button>
            </div>
            
            <div class="text-right">
                <button class="btn btn-primary" on:click={handleSync} disabled={isSyncing}>
                    {isSyncing ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลอัปเดตลง Google Sheets'}
                </button>
                {#if syncMessage}
                    <p class="mt-2 text-sm {isSyncing ? 'text-warning' : 'text-success'}">{syncMessage}</p>
                {/if}
            </div>
        </div>

        <div class="divider"></div>

        <h3 class="font-bold text-lg mb-4">รายชื่อผู้เข้าร่วมแคมเปญ ({documents.length} คน)</h3>
        
        {#if isLoadingDocs}
            <div class="text-center p-4"><span class="loading loading-spinner loading-lg"></span></div>
        {:else if documents.length === 0}
            <div class="text-center p-4 text-gray-500">ยังไม่มีข้อมูลในระบบ</div>
        {:else}
            <div class="overflow-x-auto h-96 border rounded-lg">
                <table class="table table-pin-rows">
                    <thead>
                        <tr class="bg-base-200">
                            <th>ลำดับ</th>
                            <th>คำนำหน้า</th>
                            <th>ชื่อ</th>
                            <th>นามสกุล</th>
                            <th>จังหวัด</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>ความคิดเห็น</th>
                            <th>วันที่ (Timestamp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each documents as doc, index}
                            <tr>
                                <th>{index + 1}</th>
                                <td>{doc.prefix || '-'}</td>
                                <td>{doc.firstname}</td>
                                <td>{doc.lastname}</td>
                                <td>{doc.location}</td>
                                <td>{doc.email || '-'}</td>
                                <td>{doc.phone || '-'}</td>
                                <td>{doc.comment || '-'}</td>
                                <td>{doc.timestamp ? new Date(doc.timestamp._seconds * 1000).toLocaleString('th-TH') : '-'}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
</div>