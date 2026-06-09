<script lang="ts">
    import { onMount } from 'svelte';

    export let items: string[] = [];
    export let limit: number = 0;
    export let random: boolean = false;

    let displayCards: any[] = [];
    
    // 1. ตัวแปรสำหรับจัดการ Modal
    let selectedCard: any = null; 
    let imageModal: HTMLDialogElement; 

    function getBaseName(url: string) {
        const filename = url.split('/').pop() || 'เอกสาร';
        return filename.substring(0, filename.lastIndexOf('.'));
    }

    onMount(() => {
        const fileMap = new Map();

        items.forEach(url => {
            const ext = url.split('.').pop()?.toLowerCase();
            const baseName = getBaseName(url);
            const basePath = url.substring(0, url.lastIndexOf('.'));

            if (!fileMap.has(basePath)) {
                fileMap.set(basePath, { imgUrl: null, pdfUrl: null, name: baseName });
            }

            if (ext === 'pdf') {
                fileMap.get(basePath).pdfUrl = url;
            } else {
                fileMap.get(basePath).imgUrl = url;
            }
        });

        let cards = Array.from(fileMap.values()).map(data => {
            return {
                previewSrc: data.imgUrl,
                downloadSrc: data.pdfUrl || data.imgUrl,
                isPdf: !!data.pdfUrl,
                name: data.name
            };
        });

        if (random) cards.sort(() => 0.5 - Math.random());
        if (limit > 0) cards = cards.slice(0, limit);
        
        displayCards = cards;
    });

    // 2. ฟังก์ชันเปิด Modal
    function openModal(card: any) {
        selectedCard = card;
        if (imageModal) imageModal.showModal();
    }
</script>

{#if displayCards.length === 0}
    <div class="flex justify-center p-8"><span class="loading loading-spinner loading-lg text-primary"></span></div>
{:else}
    <div class="columns-1 sm:columns-2 md:columns-3 gap-6">
        {#each displayCards as card}
            <div class="card bg-yellow-100 shadow-md border hover:shadow-lg transition-shadow mb-6 break-inside-avoid overflow-hidden">
                
                <figure 
                    class="relative w-full bg-yellow-200 cursor-pointer group"
                    on:click={() => openModal(card)}
                >
                    {#if card.previewSrc}
                        <img src={card.previewSrc} class="w-full h-auto transition-transform duration-300 group-hover:scale-105" alt={card.name} />
                        
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center z-10">
                            <span class="text-white opacity-0 group-hover:opacity-100 text-4xl drop-shadow-md">🔍</span>
                        </div>
                    {:else}
                        <div class="w-full aspect-[1/1.414] flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                            <span class="text-5xl mb-2">📄</span>
                            <span class="text-sm">ไม่มีรูปพรีวิว</span>
                        </div>
                    {/if}

                    {#if card.isPdf}
                        <div class="absolute top-2 right-2 bg-error text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-20">
                            PDF
                        </div>
                    {/if}
                </figure>

                <!-- <div class="card-body p-4 flex flex-row items-center justify-between gap-2">
                    <div class="text-sm text-gray-600 font-medium truncate flex-1" title={card.name}>
                        {card.name}
                    </div>
                    <a href={card.downloadSrc} download target="_blank" class="btn btn-sm btn-primary shrink-0">
                        ⬇️ โหลด
                    </a>
                </div> -->
            </div>
        {/each}
    </div>

    <dialog bind:this={imageModal} class="modal modal-bottom sm:modal-middle backdrop-blur-sm">
        {#if selectedCard}
            <div class="modal-box p-0 max-w-4xl bg-base-200 overflow-hidden shadow-2xl border border-gray-300">
                
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-30 text-gray-800 bg-white bg-opacity-70 hover:bg-opacity-100 shadow-sm border border-gray-200">✕</button>
                </form>
                
                <div class="w-full bg-yellow-100 flex justify-center items-center relative" style="max-height: 75vh;">
                    {#if selectedCard.previewSrc}
                        <img src={selectedCard.previewSrc} class="max-w-full max-h-[75vh] object-contain" alt={selectedCard.name} />
                    {:else}
                        <div class="w-full h-64 flex flex-col items-center justify-center bg-gray-800 text-gray-400">
                            <span class="text-5xl mb-2">📄</span>
                            <span class="text-sm">ไม่มีรูปพรีวิวให้แสดง</span>
                        </div>
                    {/if}
                </div>

                <div class="p-5 flex flex-col sm:flex-row justify-between items-center bg-base-100 gap-4">
                    <h3 class="font-bold text-lg text-gray-800 truncate w-full sm:w-auto">{selectedCard.name}</h3>
                    <a href={selectedCard.downloadSrc} download target="_blank" class="btn btn-primary w-full sm:w-auto">
                        ⬇️ ดาวน์โหลด {selectedCard.isPdf ? 'ไฟล์ PDF' : 'รูปภาพ'}
                    </a>
                </div>
            </div>
            
            <form method="dialog" class="modal-backdrop">
                <button>ปิดหน้าต่าง</button>
            </form>
        {/if}
    </dialog>
{/if}