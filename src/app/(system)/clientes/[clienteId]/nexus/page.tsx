import React from "react";
import NexusClient from "@/components/nexus/NexusClient";

export default async function Page({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  return <NexusClient clienteId={clienteId} />;
}
