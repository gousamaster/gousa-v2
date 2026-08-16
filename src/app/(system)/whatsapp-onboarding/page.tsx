"use client";

export default function WhatsAppOnboardingPage() {
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
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white"
      >
        Conectar WhatsApp
      </button>
    </div>
  );
}
