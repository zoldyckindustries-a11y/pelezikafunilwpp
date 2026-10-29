import { NextRequest, NextResponse } from "next/server";
import getRedisClient from "@/lib/redis";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    const redis = await getRedisClient();
    const data = await redis.get(key);

    if (!data) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    try {
      return NextResponse.json(JSON.parse(data)); // tenta parsear como JSON
    } catch {
      return NextResponse.json({ value: data }); // se falhar, retorna como string
    }
  } catch (error) {
    console.error("Erro ao acessar Redis (GET):", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const redis = await getRedisClient();
    await redis.set(key, JSON.stringify(value), {EX: 1800}); // salva como JSON string

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao acessar Redis (POST):", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
