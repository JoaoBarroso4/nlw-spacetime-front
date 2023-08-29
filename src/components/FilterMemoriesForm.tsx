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

dayjs.locale(ptBr);

interface Memory {
  id: string;
  coverUrl: string;
  content: string;
  createdAt: string;
}

export function FilterMemoriesForm() {
  const token = Cookies.get("token");

  const [beginDate, setBeginDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [memories, setMemories] = useState([]);

  // fetches memories in the db everytime the page is loaded
  useEffect(() => {
    async function fetchMemories() {
      const response = await api.get("/memories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMemories(response.data);
    }

    fetchMemories();
  }, [token]);

  async function handleMemoriesFilterByDate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const response = await api.get(
      `/memories?beginDate=${beginDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setMemories(response.data);
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
      {memories.length === 0 && <EmptyMemories />}
      {memories &&
        memories.map((memory: Memory) => {
          return (
            <div key={memory.id} className="flex flex-col space-y-4">
              <time className="flex items-center gap-2 text-sm text-gray-100 -ml-8 before:h-px before:w-5 before:bg-gray-50">
                {dayjs(memory.createdAt).format("D [ de ]MMMM[, ] YYYY")}
              </time>
              <Image
                src={memory.coverUrl}
                width={592}
                height={280}
                className="w-full aspect-video object-cover rounded-lg"
                alt=""
              />
              <p className="text-lg leading-relaxed text-gray-100">
                {memory.content}
              </p>
              {memory.content.endsWith("...") && (
                <Link
                  href={`/memories/${memory.id}`}
                  className="flex items-center gap-2 text-sm text-gray-200 hover:text-gray-100"
                >
                  Ler mais <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href={{
                  pathname: "/memories/edit",
                  query: { data: memory.id },
                }}
                className="inline-block self-end rounded-full bg-green-500 px-5 py-3 font-alt text-sm uppercase leading-none text-black hover:bg-green-600"
              >
                Editar memória
              </Link>
            </div>
          );
        })}
    </>
  );
}
