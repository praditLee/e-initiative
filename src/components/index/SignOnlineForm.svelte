<script lang="ts">
	// import { onDestroy, onMount } from 'svelte';
	import { createForm } from 'felte';
	import { reporter, ValidationMessage } from '@felte/reporter-svelte';
	import { Value } from '@sinclair/typebox/value';
	import PenIcon from '../icons/PenIcon.svelte';
	import ResetIcon from '../icons/ResetIcon.svelte';
	import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
	import Turnstile from '../Turnstile.svelte';
	import { documentsTable, MAX_LOCATION_LENGTH } from '../../models/document';
	import { submitDocument } from '../../utils/firebase';


	let successDialog: HTMLDialogElement;
	let errorDialog: HTMLDialogElement;
	let turnstileRef: Turnstile;
	let isLoading = false;
	let turnstileToken: string | null = null;
	let isSubscribe = false;
	const provinces = [
        "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
        "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
        "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
        "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
        "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
        "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
        "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา",
        "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
        "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
        "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง",
        "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
        "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
        "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
        "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
        "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์",
        "อุทัยธานี", "อุบลราชธานี"
    ];

	const { form, setTouched, setData, data, reset } = createForm({
		validate: (values) => {
            // 1. จำลองข้อมูลโดยเติม "-" ให้กับช่องที่ว่าง เพื่อหลอกให้ Validation ผ่าน
            const checkValues = {
                ...values,
                comment: values.comment ? values.comment : "-",
                email: values.email ? values.email : "-",
                phone: values.phone ? values.phone : "-",
                lineId: values.lineId ? values.lineId : "-"
            };

			const errors = Object.fromEntries(
				[...Value.Errors(documentsTable, checkValues)].map((e) => [
					e.path.replace('/', ''),
					e.message,
				]),
			);

			return errors;
		},
		async onSubmit(values) {
			isLoading = true;
			try {
                // 2. เติม "-" ให้ข้อมูลจริงก่อนส่งเข้า Database / Google Sheets
                const finalValues = {
                    ...values,
                    comment: values.comment ? values.comment : "-",
                    email: values.email ? values.email : "-",
                    phone: values.phone ? values.phone : "-",
                    lineId: values.lineId ? values.lineId : "-"
                };

				if (!Value.Check(documentsTable, finalValues)) {
					throw [...Value.Errors(documentsTable, finalValues)];
				}

                // สังเกตตรงนี้: เราเปลี่ยนมาส่ง finalValues แทน values เดิม
				await submitDocument(finalValues, turnstileToken!);
				
                successDialog.showModal();
				reset();
				turnstileToken = null;
				turnstileRef?.reset();
			} catch (e) {
				errorDialog.showModal();
			}
			isLoading = false;
		},
		extend: reporter,
	});

	
</script>

<form use:form class="form-control w-full">
	<ValidationMessage for="location" let:messages>
        <label class="label" for="location">
            <span class="body-03 label-text font-bold">จังหวัด*</span>
        </label>
        
        <select
            id="location"
            name="location"
            class="select w-full rounded-sm bg-base-200 {messages ? 'select-error' : ''}"
            disabled={isLoading}
        >
            <option value="" disabled selected>-- กรุณาเลือกจังหวัด --</option>
            {#each provinces as province}
                <option value={province}>{province}</option>
            {/each}
        </select>

        <div class="label">
            <span class="body-01 {messages ? 'text-error' : ''}">
                กรุณาระบุจังหวัดที่ท่านกรอกข้อมูล
            </span>
        </div>
    </ValidationMessage>

	<div class="flex flex-col md:flex-row md:space-x-[10px]">
        
        <div class="flex flex-row space-x-[10px] flex-1">
            <div class="form-control">
                <label class="label" for="prefix">
                    <span class="body-03 label-text font-bold">คำนำหน้า</span>
                </label>
                <select
                    id="prefix"
                    class="select max-w-xs rounded-sm bg-base-200"
                    disabled={isLoading}
                    name="prefix"
                >
                    <option selected />
                    <option>นาย</option>
                    <option>นาง</option>
                    <option>นางสาว</option>
                </select>
            </div>
            <div class="form-control flex-1">
                <ValidationMessage for="firstname" let:messages>
                    <label class="label" for="firstname">
                        <span class="body-03 label-text font-bold">ชื่อ*</span>
                    </label>
                    <input
                        id="firstname"
                        type="text"
                        name="firstname"
                        class="input w-full rounded-sm bg-base-200 {messages ? 'input-error' : ''}"
                        disabled={isLoading}
                    />
                    <div class="label">
                        <span class="body-01 {messages ? 'text-error' : ''}">ระบุชื่อจริงเป็นภาษาไทย</span>
                    </div>
                </ValidationMessage>
            </div>
        </div>

        <div class="form-control flex-1 mt-1 md:mt-0">
            <ValidationMessage for="lastname" let:messages>
                <label class="label" for="lastname">
                    <span class="body-03 label-text font-bold">นามสกุล*</span>
                </label>
                <input
                    id="lastname"
                    type="text"
                    name="lastname"
                    class="input w-full rounded-sm bg-base-200 {messages ? 'input-error' : ''}"
                    disabled={isLoading}
                />
                <div class="label">
                    <span class="body-01 {messages ? 'text-error' : ''}">ระบุนามสกุลเป็นภาษาไทย</span>
                </div>
            </ValidationMessage>
        </div>
        
    </div>

<!-- 2. เพิ่ม Checkbox สำหรับรับข่าวสาร -->
<div class="form-control mt-2 border border-base-300 rounded-md p-3 bg-base-50">
    <label class="label cursor-pointer justify-start space-x-3">
        <input type="checkbox" bind:checked={isSubscribe} class="checkbox" disabled={isLoading} />
        <span class="label-text font-bold">ต้องการรับข้อมูลข่าวสารกิจกรรม</span>
    </label>

    
        <div class="flex-col md:flex-row md:space-x-[10px] mt-4 pt-2 border-t border-base-200 animate-fade-in-down {isSubscribe ? 'flex' : 'hidden'}">
            <div class="form-control flex-1">
                <ValidationMessage for="email" let:messages>
                    <label class="label" for="email">
                        <span class="body-03 label-text font-bold">อีเมล</span>
                    </label>
                    <input id="email" type="email" name="email" class="input w-full rounded-sm bg-base-200 {messages ? 'input-error' : ''}" disabled={isLoading} />
                </ValidationMessage>
            </div>
            
            <div class="form-control flex-1 mt-1 md:mt-0">
                <ValidationMessage for="phone" let:messages>
                    <label class="label" for="phone">
                        <span class="body-03 label-text font-bold">เบอร์โทรศัพท์</span>
                    </label>
                    <input id="phone" type="tel" name="phone" class="input w-full rounded-sm bg-base-200 {messages ? 'input-error' : ''}" disabled={isLoading} />
                </ValidationMessage>
            </div>

        </div>
   
</div>
	<!-- กล่องคอมเมนต์แสดงความคิดเห็น -->
<div class="form-control mt-2">
    <ValidationMessage for="comment" let:messages>
        <label class="label" for="comment">
            <span class="body-03 label-text font-bold">แสดงความคิดเห็นเกี่ยวกับเรื่องนี้</span>
        </label>
        <textarea
            id="comment"
            name="comment"
            class="textarea w-full rounded-sm bg-base-200 {messages ? 'textarea-error' : ''}"
            disabled={isLoading}
            rows="3"
            placeholder="คุณมีความคิดเห็นอย่างไรเกี่ยวกับการร่างรัฐธรรมนูญฉบับนี้..."
        ></textarea>
    </ValidationMessage>
</div>

	<div class="form-control">
		<label class="label cursor-pointer justify-normal space-x-2">
			<input type="checkbox" name="consent" class="checkbox-primary checkbox" />
			<span class="label-text"
				>ข้าพเจ้ายินยอมลงชื่อ <a href="privacy-policy" class="underline"
					>อ่านนโยบายการคุ้มครองข้อมูลส่วนบุคคล</a
				></span
			>
		</label>
	</div>
	<div class="mt-2 flex justify-center">
		<Turnstile
			bind:this={turnstileRef}
			on:verify={(e) => (turnstileToken = e.detail)}
			on:error={() => (turnstileToken = null)}
			on:expire={() => (turnstileToken = null)}
		/>
	</div>
	<button
		type="submit"
		class="body-03 btn btn-primary mt-2 w-full text-base font-bold text-base-100 disabled:text-base-100"
		disabled={!$data.consent || !turnstileToken || isLoading}
	>
		{#if !isLoading}
			ลงชื่อเลย
			<PenIcon />
		{:else}
			กำลังลงชื่อ...
			<span class="loading loading-spinner" />
		{/if}
	</button>
</form>

<dialog bind:this={successDialog} class="modal modal-bottom sm:modal-middle">
    <!-- เพิ่ม gap-4 เพื่อให้มีระยะห่างระหว่างข้อความกับปุ่ม -->
    <form method="dialog" class="modal-box flex flex-col gap-4">
        <div class="flex flex-row items-center justify-center gap-1 mt-2">
            <span class="text-success text-lg"><CheckmarkIcon /></span>
            <span class="text-lg font-bold">ลงชื่อสำเร็จ!</span>
        </div>
        
        <!-- นำปุ่มทั้งสองมารวมเป็นกลุ่มเดียวกันและใส่ gap-2 -->
        <div class="flex flex-col gap-2 mt-2">
            <button 
                class="btn btn-primary btn-block text-lg" 
                on:click={() => window.location.href = '/share/1'}
            >
                คลิกเพื่อไปรับภาพประกาศจุดยืน!
            </button>
            
            <!-- ปุ่มปิดหน้าต่างที่เราเพิ่มเข้าไปใหม่ -->
            <button class="btn btn-ghost btn-block text-base text-gray-500 hover:bg-base-200">
                ปิด
            </button>
        </div>
    </form>
</dialog>

<dialog bind:this={errorDialog} class="modal modal-bottom sm:modal-middle">
	<form method="dialog" class="modal-box flex flex-col">
		<p class="text-center">
			เกิดข้อผิดพลาดในการลงชื่อ โปรดลองลงชื่อใหม่อีกครั้ง
		</p>
		<div class="modal-action">
			<button class="btn btn-block">ปิด</button>
		</div>
	</form>
</dialog>
