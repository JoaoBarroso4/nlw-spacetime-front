"use client";

import { Camera } from "lucide-react";
import { MediaPicker } from "./MediaPicker";
import { FormEvent } from "react";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Toast } from "./Toast";

export function NewMemoryForm() {
  const router = useRouter();

  async function handleCreateMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    console.log(formData);

    const fileToUpload = formData.get("media") as File;

    let mediaUrl = "";

    if (fileToUpload) {
      const uploadFormData = new FormData();

      uploadFormData.set("file", fileToUpload);

      try {
        const uploadResponse = await api.post("/upload", uploadFormData);

        mediaUrl = uploadResponse.data.fileUrl;
      } catch (error) {
        toast.error(
          // @ts-ignore
          `Erro ao fazer upload do arquivo: ${error.response.data.message}`
        );
      }
    }

    const token = Cookies.get("token");

    try {
      api
        .post(
          "/memories",
          {
            coverUrl: mediaUrl,
            content: formData.get("content"),
            isPublic: formData.get("isPublic"),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((dbResponse) => {
          if (dbResponse.status === 201) {
            router.push("/");
            setTimeout(
              () => toast.success("Memória cadastrada com sucesso."),
              500
            );
          }
        });
    } catch (error) {
      toast.error("Erro ao cadastrar memória.");
    }
  }

  return (
    <form onSubmit={handleCreateMemory} className="flex flex-1 flex-col gap-2">
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
            value="true"
            className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-500"
          />
          Tornar memória pública
        </label>
      </div>

      <MediaPicker />
      <textarea
        name="content"
        spellCheck={false}
        className="w-full flex-1 resize-none roudned border-0 bg-transparent p-0 text-lg leading-relaxed text-gray-100 placeholder:text-gray-400 focus:ring-0"
        placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
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
