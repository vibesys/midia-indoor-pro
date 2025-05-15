import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Midia = {
  id: string;
  name: string;
  type: string;
};

export default function MediaFiles() {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMidias();
  }, []);

  async function fetchMidias() {
    setLoading(true);
    const { data, error } = await supabase.from("media_files").select("*");
    if (error) {
      alert("Erro ao buscar mídias");
      console.error(error);
    } else {
      setMidias(data || []);
    }
    setLoading(false);
  }

  async function deleteMidia(midia: Midia) {
    const { error: deleteFileError } = await supabase.storage
      .from("media-files")
      .remove([midia.name]);

    const { error: deleteDbError } = await supabase
      .from("media_files")
      .delete()
      .eq("id", midia.id);

    if (deleteFileError || deleteDbError) {
      alert("Erro ao excluir");
      console.error(deleteFileError || deleteDbError);
    } else {
      fetchMidias(); // Atualiza a lista
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const { data, error: uploadError } = await supabase.storage
      .from("media-files")
      .upload(file.name, file, {
