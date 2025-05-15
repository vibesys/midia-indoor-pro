import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

type Midia = {
  id: string;
  name: string;
  type: string;
};

export default function MediaFiles() {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function deleteMidia(id: string) {
    const { error } = await supabase.from("media_files").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir");
      console.error(error);
    } else {
      fetchMidias(); // Atualiza a lista
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mídias</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {midias.map((m) => (
            <li key={m.id} className="flex justify-between bg-gray-100 p-2 rounded">
              <span>
                {m.name} ({m.type})
              </span>
              <button
                onClick={() => deleteMidia(m.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
