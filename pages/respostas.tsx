import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout'
import Link from 'next/link'

interface FormResponse {
  id: string
  container_id: string
  container_name: string
  location: string
  role: string
  email: string
  created_at: string
}

export default function ListaRespostas() {
  const [respostas, setRespostas] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'gerente') {
      window.location.href = '/login'
      return
    }

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRespostas(data as FormResponse[])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Respostas dos Formulários</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : respostas.length === 0 ? (
          <p className="text-gray-500">Nenhuma resposta registrada ainda.</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Container</th>
                  <th className="text-left p-3">Responsável</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {respostas.map((resp) => (
                  <tr key={resp.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(resp.created_at).toLocaleString()}</td>
                    <td className="p-3">{resp.container_name}</td>
                    <td className="p-3">{resp.email}</td>
                    <td className="p-3 capitalize">{resp.role}</td>
                    <td className="p-3">
                      <Link
                        href={`/dashboard/respostas/${resp.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
