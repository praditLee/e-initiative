<script lang="ts">
    import { getFunctions, httpsCallable } from 'firebase/functions';
    import { getApp } from 'firebase/app';

    let isSyncing = false;
    let message = "";

    async function handleSync() {
        isSyncing = true;
        message = "กำลังประมวลผลและส่งข้อมูล...";
        
        try {
            const functions = getFunctions(getApp());
            // เรียกใช้ชื่อฟังก์ชันให้ตรงกับที่เราตั้งไว้ใน index.ts
            const syncData = httpsCallable(functions, 'syncToGoogleSheets'); 
            const result = await syncData();
            
            message = `อัปเดตสำเร็จ! ส่งข้อมูลไปทั้งหมด ${(result.data as any).totalExported} รายการ`;
        } catch (error) {
            console.error(error);
            message = "เกิดข้อผิดพลาด: คุณอาจจะไม่มีสิทธิ์แอดมิน หรือตั้งค่าผิดพลาด";
        }
        
        isSyncing = false;
    }
</script>

<div class="p-4 bg-base-200 rounded-lg text-center mt-4">
    <h3 class="font-bold mb-2">ระบบซิงค์ข้อมูล (เฉพาะแอดมิน)</h3>
    <button 
        class="btn btn-primary" 
        on:click={handleSync} 
        disabled={isSyncing}
    >
        {isSyncing ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลอัปเดตลง Google Sheets'}
    </button>
    
    {#if message}
        <p class="mt-2 text-sm {isSyncing ? 'text-warning' : 'text-success'}">
            {message}
        </p>
    {/if}
</div>