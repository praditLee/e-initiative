<script lang="ts">
    import { onMount } from 'svelte';

    export let url: string = '';

    $: isFacebook = url.toLowerCase().includes('facebook.com');
    $: isTwitter = url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com');

    // ตัวแปรสำหรับเก็บลิงก์ที่ถูก "ทำความสะอาด" แล้ว
    let cleanUrl = url;

    // ฟังก์ชันแปลงลิงก์ Facebook อัตโนมัติ (ทำงานเมื่อ url เปลี่ยนแปลง)
    $: if (isFacebook) {
        try {
            const urlObj = new URL(url);
            
            // ตรวจสอบว่าเป็นลิงก์แบบ story.php หรือไม่
            if (urlObj.pathname.includes('story.php')) {
                const fbid = urlObj.searchParams.get('story_fbid');
                const id = urlObj.searchParams.get('id');
                
                // ถ้ามีรหัสครบทั้ง 2 ตัว ให้ประกอบร่างลิงก์ใหม่
                if (fbid && id) {
                    cleanUrl = `https://www.facebook.com/${id}/posts/${fbid}`;
                }
            } else {
                // ถ้าไม่ใช่ story.php ก็แค่ลบพารามิเตอร์ขยะทิ้งเพื่อให้ลิงก์สั้นและปลอดภัยขึ้น
                urlObj.searchParams.delete('mibextid');
                urlObj.searchParams.delete('rdid');
                cleanUrl = urlObj.toString();
            }
        } catch (e) {
            console.error("Parse URL Error:", e);
            cleanUrl = url; // ถ้าแปลงพัง ให้ใช้ลิงก์เดิมไปก่อน
        }
    }

    onMount(() => {
        if (isTwitter && !window.twttr) {
            const script = document.createElement("script");
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            document.head.appendChild(script);
        }
    });
</script>

<div class="w-full flex justify-center my-6">
    {#if isFacebook}
        <div class="bg-white rounded-lg shadow-md overflow-hidden w-full">
            <iframe 
                src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(cleanUrl)}&show_text=true&width=500`} 
                width="100%" 
                height="500" 
                style="border:none;overflow:hidden" 
                scrolling="yes" 
                frameborder="0" 
                allowfullscreen="true" 
                title="Facebook Post"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
            </iframe>
        </div>

    {:else if isTwitter}
        <div class="w-full">
            <blockquote class="twitter-tweet" data-dnt="true" data-theme="light">
                <a href={url.replace('x.com', 'twitter.com')}>กำลังโหลดโพสต์จาก X...</a>
            </blockquote>
        </div>

    {:else}
        <div class="card bg-base-200 border w-full">
            <div class="card-body p-6 text-center flex flex-col gap-4">
                <span class="text-4xl">🔗</span>
                <p class="font-bold text-gray-700">อัปเดตความเคลื่อนไหว</p>
                <a href={url} target="_blank" class="btn btn-primary w-full">คลิกเพื่ออ่านโพสต์ต้นฉบับ</a>
            </div>
        </div>
    {/if}
</div>