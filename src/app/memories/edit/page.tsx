"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Toast } from "@/components/Toast";

interface Memory {
  id: string;
  coverUrl: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
}

export default function EditMemoryForm(props: any) {
  const token = Cookies.get("token");
  const router = useRouter();

  const { data } = props.searchParams; // data = memory id

  const [dbResponse, setDbResponse] = useState<Memory | null>(null);

  async function handleEditMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dbResponse) return;

    const formData = new FormData(event.currentTarget);
    const id = dbResponse.id;
    const content = formData.get("content");
    const isPublic = formData.get("isPublic");
    const coverUrl = preview || dbResponse.coverUrl;

    try {
      const apiResponse = await api.put(
        `/memories/${id}`,
        { coverUrl, content, isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (apiResponse.status === 200) {
        router.push("/");
        setTimeout(() => toast.success("Memória editada com sucesso."), 500);
      }
    } catch (error) {
      toast.error("Erro ao editar memória.");
    }
  }

  useEffect(() => {
    async function fetchMemoryData() {
      try {
        const response = await api.get(`/memories/${data}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDbResponse(response.data);
      } catch (error) {
        toast.error("Erro ao carregar memória.");
      }
    }

    if (token) {
      fetchMemoryData();
    }
  }, [token, data]);

  const [preview, setPreview] = useState<string | null>(null);

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;

    if (!files) return;

    const previewUrl = URL.createObjectURL(files[0]);

    setPreview(previewUrl);
  }

  return (
    <form
      onSubmit={handleEditMemory}
      className="flex flex-1 flex-col gap-2 p-8"
    >
      <div className="flex items-center gap-4">
        <label
          htmlFor="media"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-200 hover:text-gray-100"
        >
          <Camera className="h-4 w-4" />
          Anexar mídia
        </label>
        <label
          htmlFor="isPublic"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-200 hover:text-gray-100"
        >
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            defaultChecked={dbResponse ? dbResponse.isPublic : false}
            className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-500"
          />
          Tornar memória pública
        </label>
      </div>

      <input
        onChange={onFileSelected}
        type="file"
        name="media"
        id="media"
        accept="image/*, video/*"
        className="invisible h-0 w-0"
      />
      {dbResponse && (
        // eslint-disable-next-line
        <img
          src={preview ? preview : dbResponse.coverUrl}
          alt=""
          className="w-full aspect-video rounded-lg object-cover"
        />
      )}

      <textarea
        name="content"
        spellCheck={false}
        className="w-full flex-1 resize-none roudned border-0 bg-transparent p-0 text-lg leading-relaxed text-gray-100 placeholder:text-gray-400 focus:ring-0"
        placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
        defaultValue={dbResponse ? dbResponse.content : ""}
      />

      <button
        type="submit"
        className="inline-block self-end rounded-full bg-green-500 px-5 py-3 font-alt text-sm uppercase leading-none text-black hover:bg-green-600"
      >
        Salvar
      </button>
      <Toast />
    </form>
  );
}
