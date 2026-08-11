import React from "react";
import NexusClient from "@/components/nexus/NexusClient";

export default function Page({ params }: { params: { clienteId: string } }) {
  const { clienteId } = params;
  return <NexusClient clienteId={clienteId} />;
}
