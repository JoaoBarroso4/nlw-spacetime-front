"use client";

import { CustomModal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { api } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface Memory {
  id: string;
  coverUrl: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
}

export default function SharedMemory(props: any) {
  const token = Cookies.get("token");

  const router = useRouter();

  const { data: memoryId } = props.searchParams;
  const [dbResponse, setDbResponse] = useState<Memory | null>(null);

  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchMemoryData() {
      try {
        api
          .get(`/memories/${memoryId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            if (response.data.isPublic) {
              setDbResponse(response.data);

              setMediaType(
                response.data.coverUrl.match(/(png|jpe?g|gif)$/)
                  ? "image"
                  : "video"
              );
            } else {
              setDbResponse(null);
              setModalOpen(true);
            }
          });
      } catch (error) {
        console.log(error);
        toast.error("Erro ao carregar memória.");
      }
    }

    if (memoryId) fetchMemoryData();
  }, [memoryId, token]);

  return (
    <div className="flex flex-col gap-2 p-8">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-gray-200 hover:text-gray-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar à timeline
      </Link>
      {(!dbResponse || !dbResponse?.isPublic) && (
        <div className="flex justify-center mt-5">
          <p className="text-lg text-gray-200">Esta memória é privada.</p>
        </div>
      )}

      {dbResponse && (
        <div className="w-full aspect-video rounded-lg overflow-hidden">
          {mediaType === "image" ? (
            // eslint-disable-next-line
            <img
              src={dbResponse?.coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={dbResponse?.coverUrl}
              className="w-full h-full object-cover"
              controls
            >
              Your browser does not support video playback.
            </video>
          )}
        </div>
      )}

      <textarea
        name="content"
        readOnly
        className="w-full flex-1 resize-none roudned border-0 bg-transparent p-0 text-lg leading-relaxed text-gray-100 placeholder:text-gray-400 focus:ring-0"
        defaultValue={dbResponse ? dbResponse.content : ""}
      />

      <Toast />

      <CustomModal
        open={modalOpen}
        setOpen={setModalOpen}
        title="Memória privada"
        content="Você não pode acessar esta memória, pois o criar não a tornou pública."
        actionText="Voltar à timeline"
        handleAction={() => router.push("/")}
      />
    </div>
  );
}
