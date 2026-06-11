<script lang="ts">
    import { onMount } from 'svelte';
    import SocialEmbed from './SocialEmbed.svelte';

    // นำลิงก์ CSV ที่ได้จากข้อ 2 มาใส่ตรงนี้
    export let csvUrl: string = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRmW44CbSnt-QP16NQAAYlgObyEG8yrUeaGoBSx28XZONU0AHdxAwnyPHK8MCwP1w7oDh3xWI7W6CLn/pub?gid=0&single=true&output=csv';
    
    let links: string[] = [];
    let loading = true;

    onMount(async () => {
        try {
            // ดึงข้อมูลจาก Google Sheets
            const response = await fetch(csvUrl);
            const text = await response.text();
            
            // แยกข้อมูลเป็นบรรทัดๆ
            const rows = text.split('\n').map(row => row.trim()).filter(row => row !== '');
            
            // ตัดบรรทัดแรก (หัวข้อ 'URL') ออก และดึงเฉพาะข้อมูลลิงก์
            if (rows.length > 1) {
                // สมมติว่ามีคอลัมน์เดียว เราเลยเอาแค่ช่องแรก และลบเครื่องหมายคำพูด (") เผื่อระบบใส่มา
                links = rows.slice(1).map(row => row.split(',')[0].replace(/"/g, ''));
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        } finally {
            loading = false;
        }
    });
</script>

<div class="w-full">
    {#if loading}
        <div class="flex justify-center p-8">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
    {:else if links.length === 0}
        <p class="text-center text-gray-500">ยังไม่มีการอัปเดตความเคลื่อนไหว</p>
    {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {#each links as link}
            <SocialEmbed url={link} />
        {/each}
    </div>
        
    {/if}
</div>