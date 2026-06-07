<script lang="ts">
    export let currentId: number;

    const artworks = [
        { id: 1, src: '/share/ant1.png', alt: 'ประชาชนอยู่ตรงไหน' },
        { id: 2, src: '/share/ant2.png', alt: 'ประชาชนอยู่ตรงไหน' },
        { id: 3, src: '/share/ant3.png', alt: 'ประชาชนอยู่ตรงไหน' },
        { id: 4, src: '/share/ant4.png', alt: 'Where are the people' },
        { id: 5, src: '/share/ant5.png', alt: 'people people people' }
    ];

    // ค้นหารูปปัจจุบันที่กำลังแสดง
    $: selectedArt = artworks.find(art => art.id === currentId) || artworks[0];
    
    // สร้าง URL จริงของหน้านี้เพื่อส่งให้ Facebook (แก้โดเมนให้เป็นของจริงด้วยนะครับ)
    $: currentUrl = `https://ants.actlabthailand.org/share/${currentId}`; 
    const shareText = "ฉันขอประกาศจุดยืน ไม่เอาด้วยกับการร่างรัฐธรรมนูญที่ไม่ใส่ใจเสียงของประชาชน!";
</script>

<div class="bg-base-200 p-6 rounded-lg mb-8 shadow-md">
    
    <div class="w-full h-80 bg-gray-300 flex items-center justify-center rounded-lg mb-4 overflow-hidden border-4 border-white shadow-sm">
        <img src={selectedArt.src} alt={selectedArt.alt} class="w-full h-full object-cover" />
    </div>

    <p class="text-sm font-bold mb-2 text-center">เลือกลายที่คุณต้องการแชร์:</p>
    <div class="flex justify-center gap-2 mb-6">
        {#each artworks as art}
            <a 
                href={`/share/${art.id}`}
                class="w-16 h-16 rounded-md overflow-hidden border-2 transition-all block {currentId === art.id ? 'border-primary scale-110' : 'border-transparent opacity-50 hover:opacity-100'}"
            >
                <img src={art.src} alt="thumbnail" class="w-full h-full object-cover" />
            </a>
        {/each}
    </div>

    <div class="divider">แชร์จุดยืนของคุณ</div>

    <div class="flex flex-col sm:flex-row justify-center gap-4 mb-4">
        <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} 
            target="_blank" 
            class="btn bg-[#1877F2] text-white hover:bg-[#0C63D4] border-none flex-1"
        >
            แชร์ลิงก์นี้ลง Facebook
        </a>
        <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`} 
            target="_blank" 
            class="btn bg-black text-white hover:bg-gray-800 border-none flex-1"
        >
            แชร์ลิงก์นี้ลง X
        </a>
    </div>

    <a 
        href={selectedArt.src} 
        download={`stand-with-us-art-${selectedArt.id}.jpg`}
        class="btn btn-outline btn-primary w-full text-lg mt-2"
    >
        ⬇️ ดาวน์โหลดภาพนี้ไปโพสต์เอง
    </a>
</div>