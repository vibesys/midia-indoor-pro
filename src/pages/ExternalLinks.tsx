
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, ExternalLink, Eye, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  display_time: z.coerce.number().int().min(5, "Tempo mínimo é 5 segundos"),
  category: z.string().min(1, "Categoria é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

const ExternalLinks = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      display_time: 15,
      category: "",
    },
  });

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("external_links")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar links:", error);
      toast({
        title: "Erro ao carregar links",
        description: error.message || "Não foi possível carregar os links externos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleOpenDialog = (link?: any) => {
    if (link) {
      setEditingLink(link);
      form.reset({
        title: link.title,
        url: link.url,
        display_time: link.display_time,
        category: link.category,
      });
    } else {
      setEditingLink(null);
      form.reset({
        title: "",
        url: "",
        display_time: 15,
        category: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLink(null);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      if (editingLink) {
        const { error } = await supabase
          .from("external_links")
          .update({
            title: data.title,
            url: data.url,
            display_time: data.display_time,
            category: data.category,
          })
          .eq("id", editingLink.id);
        
        if (error) throw error;
        
        toast({
          title: "Link atualizado",
          description: "O link externo foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("external_links")
          .insert({
            title: data.title,
            url: data.url,
            display_time: data.display_time,
            category: data.category,
          });
        
        if (error) throw error;
        
        toast({
          title: "Link adicionado",
          description: "O link externo foi adicionado com sucesso",
        });
      }
      
      handleCloseDialog();
      fetchLinks();
    } catch (error: any) {
      console.error("Erro ao salvar link:", error);
      toast({
        title: "Erro ao salvar link",
        description: error.message || "Não foi possível salvar o link externo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("external_links")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Link removido",
        description: "O link externo foi removido com sucesso",
      });
      
      fetchLinks();
    } catch (error: any) {
      console.error("Erro ao excluir link:", error);
      toast({
        title: "Erro ao excluir link",
        description: error.message || "Não foi possível excluir o link externo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(search.toLowerCase()) ||
    link.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Links Externos</h2>
          <p className="text-muted-foreground">
            Gerenciamento de URLs externas para exibição.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => handleOpenDialog()}>
              <PlusCircle className="h-4 w-4" />
              Novo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingLink ? "Editar" : "Adicionar"} Link Externo</DialogTitle>
              <DialogDescription>
                {editingLink ? "Edite os detalhes do link externo." : "Adicione uma URL externa para exibição nos dispositivos."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título descritivo do link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="display_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Exibição (segundos)</FormLabel>
                      <FormControl>
                        <Input type="number" min="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="news">Notícias</SelectItem>
                          <SelectItem value="weather">Meteorologia</SelectItem>
                          <SelectItem value="finance">Financeiro</SelectItem>
                          <SelectItem value="events">Eventos</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card className="syntax-card function-card">
        <CardHeader>
          <CardTitle>Links Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Tempo (s)</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum link encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {link.title}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[200px]">
                      {link.url}
                    </TableCell>
                    <TableCell>{link.display_time}s</TableCell>
                    <TableCell>{link.category}</TableCell>
                    <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredLinks.length > 0 && (
        <Card className="syntax-card operator-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview de Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLinks.slice(0, 3).map((link) => (
                <div 
                  key={link.id} 
                  className="border rounded-md p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{link.title}</h3>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span>{link.category}</span>
                    <span>{link.display_time}s</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExternalLinks;
