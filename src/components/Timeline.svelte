<script lang="ts">
    // ข้อมูลไทม์ไลน์ (แยกข้อมูลออกมาเพื่อให้โค้ด HTML อ่านง่ายและแก้ไขง่าย)
    const timelineData = [
        {
            time: "พ.ศ. 2561-2563",
            title: "จุดเริ่มต้นข้อเรียกร้อง",
            content: `การชุมนุมใหญ่ของประชาชน > ลงชื่อเสนอร่างฉบับประชาชน (เช่น iLaw, Re-Solution)<br><br><span class="text-[#2e4394] font-bold text-base">ถูกรัฐสภาปัดตก</span><br>เนื่องจาก สว. ไม่โหวตให้`,
            isLast: false
        },
        {
            time: "พ.ศ. 2564",
            title: "เสนอร่างฉบับประชาชน",
            content: `ภาคประชาชนและพรรคการเมืองเสนอแก้ไขรัฐธรรมนูญอีกหลายร่าง<br><span class="text-[#2e4394] font-bold text-base">แต่ถูกรัฐสภาปัดตกทั้งหมด</span><br>(โดยเฉพาะจากการที่เสียง สว. ไม่ถึงเกณฑ์)<br><br><span class="text-[#2e4394] font-bold text-base">ผ่านการแก้ไขเพียงเรื่องระบบเลือกตั้ง "บัตร 2 ใบ"</span>`,
            isLast: false
        },
        {
            time: "พ.ศ. 2566 - 2568",
            title: "รัฐบาลเพื่อไทย",
            content: `ตั้งคณะทำงานศึกษาประชามติ (2566) เพื่อหาข้อสรุปว่าจะทำประชามติกี่ครั้ง และมีรูปแบบคำถามอย่างไร โดยรัฐบาลวาง<br><span class="text-[#2e4394] font-bold text-base">เงื่อนไข: ไม่แก้หมวด 1 และ 2</span><br><br>มีความพยายามแก้ไข พรบ.ประชามติ แต่เกิดความล่าช้าจากความเห็นต่างระหว่าง สส. และ สว.<br>(+ สส. ฝั่งน้ำเงิน)`,
            isLast: false
        },
        {
            time: "10 กันยายน 2568",
            title: "คำวินิจฉัยศาลรัฐธรรมนูญ",
            content: `ศาลรัฐธรรมนูญระบุว่ารัฐสภามีอำนาจทำ รธน. ได้ โดยต้องทำประชามติ แต่มี<br><span class="text-[#2e4394] font-bold text-base">เงื่อนไข: ประชาชนไม่สามารถเลือกผู้ร่างรัฐธรรมนูญ (สสร.) ได้โดยตรง</span><br><br>เงื่อนไขนี้สร้างข้อถกเถียงสำคัญ`,
            isLast: false
        },
        {
            time: "พ.ศ. 2569",
            title: "รัฐบาลภูมิใจไทย",
            content: `ยุบสภา และจัดเลือกตั้ง สส. พร้อมทำประชามติรอบแรก (8 กุมภาพันธ์ 2569)<br>เสียงข้างมากประมาณ<br><span class="text-[#fa5a5a] font-bold text-xl">21.6 ล้านเสียง<br>โหวตเห็นชอบ</span><br>ให้มีการจัดทำรัฐธรรมนูญฉบับใหม่`,
            isLast: false
        },
        {
            time: "มิถุนายน 2569",
            title: "สถานการณ์ปัจจุบัน",
            content: `ครม. ปัดตกร่าง 256 เดิม เริ่มกระบวนการใหม่<br><span class="text-[#2e4394] font-bold text-base">แกนนำเตรียมเสนอร่าง 256 ใหม่</span><br>เข้าสู่รัฐสภาอีกครั้ง`,
            isLast: true // ตัวสุดท้ายจุดจะเป็นวงกลมกลวง
        }
    ];
</script>

<div class="w-full bg-white shadow-md border border-gray-100 flex flex-col font-sans">
    
    <div class="bg-[#e9af13] p-5 md:p-6">
        <h2 class="text-2xl text-center md:text-3xl font-extrabold text-[#2a2626]">ไทม์ไลน์สู่รัฐธรรมนูญใหม่</h2>
    </div>

    <div class="w-full max-w-6xl mx-auto overflow-x-auto snap-x snap-mandatory hide-scrollbar">
        <div class="flex flex-row md:flex-nowrap min-w-max md:min-w-0 md:w-full">
            
            {#each timelineData as item, index}
                <div class="w-[280px] md:flex-1 shrink-0 snap-start flex flex-col relative py-8">
                    
                    <div class="h-[60px] flex flex-col justify-end items-center text-center pb-4">
                        <span class="text-xs md:text-sm text-gray-500 mb-1">{item.time}</span>
                        <span class="font-bold text-[#2a2626] leading-tight text-sm md:text-base">{item.title}</span>
                    </div>

                    <div class="relative flex justify-center items-center h-[20px] w-full my-2">
                        <div class="absolute h-1 bg-[#fa5a5a] 
                            {index === 0 ? 'left-1/2 right-0' : 
                             index === timelineData.length - 1 ? 'left-0 right-1/2' : 
                             'left-0 right-0'}"
                        ></div>
                        
                        {#if item.isLast}
                            <div class="w-5 h-5 rounded-full bg-white border-[4px] border-[#fa5a5a] relative z-10 shadow-sm"></div>
                        {:else}
                            <div class="w-5 h-5 rounded-full bg-[#fa5a5a] relative z-10 shadow-sm"></div>
                        {/if}
                    </div>

                    <div class="pt-4 px-4 text-xs md:text-sm text-gray-600 text-left leading-relaxed">
                        {@html item.content}
                    </div>

                </div>
            {/each}

        </div>
    </div>

    <div class="bg-[#fa5a5a] p-4 text-white text-center font-medium text-sm md:text-base">
        แม้จะมีประชามติเห็นชอบถึง 60.16% แต่เส้นทางสู่ รธน. ใหม่ยังเผชิญกับอุปสรรคทั้งจากเสียง สว. และข้อจำกัดทางกฎหมายเรื่องที่มาของ สสร.
    </div>

</div>

<style>
    /* ซ่อน Scrollbar ด้านล่างแต่ยังเอานิ้วปัดเลื่อนได้ตามปกติ */
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>