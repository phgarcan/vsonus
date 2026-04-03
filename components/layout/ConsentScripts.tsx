'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getConsent, type ConsentPreferences } from '@/components/ui/CookieBanner'

// IDs à remplacer quand les comptes seront configurés
const GA_MEASUREMENT_ID = '' // TODO: remplacer par l'ID GA4 (ex: G-XXXXXXXXXX)
const GTM_ID = ''            // TODO: remplacer par l'ID GTM (ex: GTM-XXXXXXX)
const HOTJAR_ID = ''         // TODO: remplacer par l'ID Hotjar (ex: 1234567)
const GADS_ID = ''           // TODO: remplacer par l'ID Google Ads (ex: AW-XXXXXXXXX)

export function ConsentScripts() {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null)

  useEffect(() => {
    // Lire le consentement initial
    setConsent(getConsent())

    // Écouter les mises à jour
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as ConsentPreferences
      setConsent(detail)
    }
    window.addEventListener('consentUpdated', handler)
    return () => window.removeEventListener('consentUpdated', handler)
  }, [])

  return (
    <>
      {/* ── Consent Mode v2 — toujours chargé, denied par défaut ────────── */}
      <Script id="consent-mode-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'denied',
          });
        `}
      </Script>

      {/* ── Consent Mode v2 — update selon le consentement ──────────────── */}
      {consent && (
        <Script id="consent-mode-update" strategy="afterInteractive">
          {`
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'update', {
              analytics_storage: '${consent.analytics ? 'granted' : 'denied'}',
              ad_storage: '${consent.marketing ? 'granted' : 'denied'}',
              ad_user_data: '${consent.marketing ? 'granted' : 'denied'}',
              ad_personalization: '${consent.marketing ? 'granted' : 'denied'}',
              functionality_storage: '${consent.functional ? 'granted' : 'denied'}',
            });
          `}
        </Script>
      )}

      {/* ── Google Analytics 4 (analytiques) ────────────────────────────── */}
      {consent?.analytics && GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      {/* ── Google Tag Manager (analytiques) ────────────────────────────── */}
      {consent?.analytics && GTM_ID && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      )}

      {/* ── Hotjar (analytiques) ────────────────────────────────────────── */}
      {consent?.analytics && HOTJAR_ID && (
        <Script id="hotjar-init" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}

      {/* ── Google Ads (marketing) ──────────────────────────────────────── */}
      {consent?.marketing && GADS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GADS_ID}');
            `}
          </Script>
        </>
      )}
    </>
  )
}
