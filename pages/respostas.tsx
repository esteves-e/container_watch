import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout'
import Link from 'next/link'

interface FormResponse {
  id: string
  responsavel: string
  dataVerificacao?: string
  veiculo?: string
  equipamento?: string
  embarcacao?: string
  location?: string
  email: string
  role: string
  created_at: string
  tipoInspecao?: string
}

export default function ListaRespostas() {
  const [respostas, setRespostas] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'gerente') {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('inspecao_veicular') // ou unificar com outras tabelas conforme necessário
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRespostas(data as FormResponse[])
      }
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Deseja realmente excluir esta resposta?')
    if (!confirmed) return
    await supabase.from('inspecao_veicular').delete().eq('id', id)
    setRespostas(respostas.filter(r => r.id !== id))
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Respostas dos Formulários</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : respostas.length === 0 ? (
          <p className="text-gray-500">Nenhuma resposta registrada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {respostas.map(resp => (
              <div key={resp.id} className="border rounded-lg p-4 shadow bg-white">
                <h2 className="font-semibold text-lg mb-1">{resp.responsavel}</h2>
                <p className="text-sm text-gray-600">{new Date(resp.created_at).toLocaleString()}</p>
                <p className="text-sm">Veículo/Equipamento: {resp.veiculo || resp.equipamento || resp.embarcacao || '—'}</p>
                <p className="text-sm">Localização: {resp.location || '—'}</p>
                <p className="text-sm">E-mail: {resp.email}</p>
                <div className="mt-2 flex gap-4">
                  <Link
                    href={`/dashboard/respostas/${resp.id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Ver detalhes
                  </Link>
                  <button
                    onClick={() => handleDelete(resp.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
