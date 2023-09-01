"use client";

import { api } from "@/lib/api";
import { EmptyMemories } from "./EmptyMemories";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import ptBr from "dayjs/locale/pt-br";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { Toast } from "./Toast";

dayjs.locale(ptBr);

interface Memory {
  id: string;
  coverUrl: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
}

export function FilterMemoriesForm() {
  const token = Cookies.get("token");

  const [beginDate, setBeginDate] = useState<string | null>("");
  const [endDate, setEndDate] = useState<string | null>("");

  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    async function fetchMemories() {
      try {
        const response = await api.get("/memories", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMemories(response.data);
      } catch (error) {
        toast.error("Erro ao carregar memórias.");
      }
    }

    fetchMemories();
  }, [token]);

  async function handleMemoriesFilterByDate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      const response = await api.get(
        `/memories?beginDate=${beginDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMemories(response.data);
    } catch (error) {
      toast.error("Erro ao carregar memórias.");
    }
  }

  function defineFileType(fileUrl: string): string {
    const isImage = fileUrl.match(/(png|jpe?g|gif)$/);
    const isVideo = fileUrl.match(/(mp4|webm)$/);

    return isImage ? "image" : isVideo ? "video" : "";
  }

  function handleShareMemory(event: React.MouseEvent<HTMLButtonElement>) {
    const memoryId = event.currentTarget.value;
    navigator.clipboard.writeText(
      `${window.location.href}/memories/shared?data=${memoryId}`
    );
    toast.success("Link copiado para a área de transferência.");
  }

  return (
    <>
      <form onSubmit={handleMemoriesFilterByDate}>
        <div className="flex flex-row flex-1 text-gray-100 items-center">
          <p className="text-lg leading-none">Filtrar por data</p>
          <input
            type="date"
            name="beginDate"
            onChange={(event) => setBeginDate(event.target.value)}
            className="rounded-full w-1/2 h-8 mx-1 bg-gray-50 text-gray-200"
          />
          {" - "}
          <input
            type="date"
            name="endDate"
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-full w-1/2 h-8 mx-1 bg-gray-50 text-gray-200"
          />
          <button
            type="submit"
            className="rounded-full bg-green-500 text-black text-sm font-alt px-3 py-1"
          >
            Filtrar
          </button>
        </div>
      </form>
      {memories.length > 0 ? (
        memories.map((memory: Memory) => {
          return (
            <div key={memory.id} className="flex flex-col space-y-4">
              <time className="flex items-center gap-2 text-sm text-gray-100 -ml-8 before:h-px before:w-5 before:bg-gray-50">
                {dayjs(memory.createdAt).format("D [ de ]MMMM[, ] YYYY")}
              </time>
              {defineFileType(memory.coverUrl) === "image" && (
                <Image
                  src={memory.coverUrl}
                  width={592}
                  height={280}
                  className="w-full aspect-video object-cover rounded-lg"
                  alt=""
                />
              )}
              {defineFileType(memory.coverUrl) === "video" && (
                <video
                  src={memory.coverUrl}
                  className="w-full aspect-video rounded-lg object-cover"
                  controls
                >
                  Seu navegador não possui suporte para a reprodução de vídeos.
                </video>
              )}
              <p className="text-lg leading-relaxed text-gray-100">
                {memory.content}
              </p>
              <div className="flex flex-row justify-between">
                {memory.content.endsWith("...") && (
                  <Link
                    href={`/memories/${memory.id}`}
                    className="flex items-center gap-2 text-sm text-gray-200 hover:text-gray-100"
                  >
                    Ler mais <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {memory.isPublic && (
                  <button
                    type="button"
                    onClick={handleShareMemory}
                    value={memory.id}
                    className="rounded-full bg-green-500 px-5 py-3 font-alt text-sm uppercase leading-none text-black hover:bg-green-600"
                  >
                    Compartilhar
                  </button>
                )}
                <Link
                  href={{
                    pathname: "/memories/edit",
                    query: { data: memory.id },
                  }}
                  className="rounded-full bg-green-500 px-5 py-3 font-alt text-sm uppercase leading-none text-black hover:bg-green-600"
                >
                  Editar memória
                </Link>
              </div>
            </div>
          );
        })
      ) : (
        <EmptyMemories />
      )}
      <Toast />
    </>
  );
}
