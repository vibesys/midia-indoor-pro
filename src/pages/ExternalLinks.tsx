
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, ExternalLink, Eye, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ExternalLinks = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");

  // Mock external links data (will be replaced with Supabase data)
  const mockLinks = [
    { 
      id: 1, 
      title: "Previsão do Tempo", 
      url: "https://climatempo.com.br", 
      displayTime: 15, 
      createdAt: "2025-05-12",
      category: "Informativo"
    },
    { 
      id: 2, 
      title: "Últimas Notícias", 
      url: "https://g1.globo.com", 
      displayTime: 30, 
      createdAt: "2025-05-10",
      category: "Notícias"
    },
    { 
      id: 3, 
      title: "Cotação do Dólar", 
      url: "https://economia.uol.com.br/cotacoes", 
      displayTime: 20, 
      createdAt: "2025-05-08",
      category: "Financeiro"
    },
    { 
      id: 4, 
      title: "Calendário de Eventos", 
      url: "https://example.com/events", 
      displayTime: 25, 
      createdAt: "2025-05-05",
      category: "Agenda"
    },
    { 
      id: 5, 
      title: "Cardápio do Dia", 
      url: "https://example.com/menu", 
      displayTime: 15, 
      createdAt: "2025-05-01",
      category: "Alimentação"
    },
  ];

  const filteredLinks = mockLinks.filter(link => 
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
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Link Externo</DialogTitle>
              <DialogDescription>
                Adicione uma URL externa para exibição nos dispositivos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Título descritivo do link" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" placeholder="https://example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayTime">Tempo de Exibição (segundos)</Label>
                <Input id="displayTime" type="number" min="5" placeholder="15" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">Notícias</SelectItem>
                    <SelectItem value="weather">Meteorologia</SelectItem>
                    <SelectItem value="finance">Financeiro</SelectItem>
                    <SelectItem value="events">Eventos</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Salvar
              </Button>
            </DialogFooter>
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
              {filteredLinks.map((link) => (
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
                  <TableCell>{link.displayTime}s</TableCell>
                  <TableCell>{link.category}</TableCell>
                  <TableCell>{link.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                  <span>{link.displayTime}s</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalLinks;
