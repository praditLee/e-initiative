<script lang="ts">
    import { onMount } from 'svelte';

    let showBanner = false;

    onMount(() => {
        // เช็กว่าผู้ใช้เคยตอบรับหรือปฏิเสธไปแล้วหรือยัง
        const consentStatus = localStorage.getItem('cookie_consent');
        
        if (!consentStatus) {
            // ถ้ายังไม่เคยตอบอะไรเลย ให้โชว์แบนเนอร์
            showBanner = true;
        } else if (consentStatus === 'granted') {
            // ถ้าเคยยอมรับแล้ว ให้ไปบอก Google Analytics ให้เริ่มเก็บข้อมูลได้
            updateGAConsent('granted');
        }
    });

    function acceptCookies() {
        localStorage.setItem('cookie_consent', 'granted');
        showBanner = false;
        updateGAConsent('granted');
    }

    function declineCookies() {
        localStorage.setItem('cookie_consent', 'denied');
        showBanner = false;
        // ไม่ต้องทำอะไรเพิ่ม เพราะเราตั้งค่าเริ่มต้นปิด GA ไว้แล้ว
    }

    function updateGAConsent(status: string) {
        // อัปเดตสถานะให้ Google Analytics ทำงาน
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': status
            });
        }
    }
</script>

{#if showBanner}
    <div class="fixed bottom-0 left-0 w-full bg-base-200 border-t border-base-300 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 p-4 sm:p-6 transition-all duration-500">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            <!-- ข้อความอธิบาย -->
            <div class="text-sm text-base-content flex-1 text-center md:text-left">
                <p class="font-bold mb-1">🍪 เว็บไซต์นี้มีการใช้งานคุกกี้ (Cookies)</p>
                <p class="text-gray-600">
                    เราใช้คุกกี้ที่จำเป็นต่อการทำงานของเว็บไซต์ และคุกกี้สถิติ (Google Analytics) เพื่อวิเคราะห์การเข้าชมและปรับปรุงประสบการณ์การใช้งานของคุณ 
                    คุณสามารถอ่านรายละเอียดเพิ่มเติมได้ที่ <a href="/privacy-policy" class="link link-primary font-medium">นโยบายความเป็นส่วนตัว</a>
                </p>
            </div>

            <!-- ปุ่มกดยอมรับ / ปฏิเสธ -->
            <div class="flex flex-row gap-2 shrink-0">
                <button on:click={declineCookies} class="btn btn-outline btn-sm sm:btn-md text-gray-500">
                    ปฏิเสธสถิติ
                </button>
                <button on:click={acceptCookies} class="btn btn-primary btn-sm sm:btn-md">
                    ยอมรับทั้งหมด
                </button>
            </div>

        </div>
    </div>
{/if}