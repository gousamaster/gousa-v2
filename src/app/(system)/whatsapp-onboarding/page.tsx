"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: unknown) => void,
        options: Record<string, unknown>
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const META_APP_ID = "1643136133449191";
const META_CONFIG_ID = "1741783210346174";

export default function WhatsAppOnboardingPage() {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB?.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v26.0",
      });

      setSdkReady(true);
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const connectWhatsApp = () => {
    if (!window.FB) {
      alert("El SDK de Meta todavía está cargando. Intenta nuevamente.");
      return;
    }

    window.FB.login(
      (response) => {
        console.log("META LOGIN RESPONSE:", response);
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "whatsapp_business_app_onboarding",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Conectar WhatsApp con Nexus
      </h1>

      <p className="mt-2 text-gray-600">
        Vincula tu número de WhatsApp Business con Nexus mediante Meta.
      </p>

      <button
        type="button"
        onClick={connectWhatsApp}
        disabled={!sdkReady}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {sdkReady ? "Conectar WhatsApp" : "Cargando Meta..."}
      </button>
    </div>
  );
}
