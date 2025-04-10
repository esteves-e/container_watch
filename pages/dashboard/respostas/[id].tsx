import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Layout from '../../../components/layout'

const mockForm = [
  { id: 'q1', label: 'Equipamento está funcionando corretamente?' },
  { id: 'q2', label: 'Há sinais de vazamento?' },
  { id: 'q3', label: 'Temperatura interna (°C)' },
  { id: 'q4', label: 'Umidade interna (%)' },
  { id: 'q5', label: 'Porta está selando corretamente?' },
  { id: 'q6', label: 'Ruídos anormais detectados?' },
  { id: 'q7', label: 'Limpeza está em dia?' },
  { id: 'q8', label: 'Nível de combustível/energia' },
  { id: 'q9', label: 'Observações do técnico' },
  { id: 'q10', label: 'Checklist adicional (se houver)' }
]

export default function DetalhesResposta() {
  const router = useRouter()
  const { id } = router.query

  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'gerente') {
      router.push('/login')
      return
    }

    if (id) {
      const fetchData = async () => {
        const { data, error } = await supabase
          .from('form_responses')
          .select('*')
          .eq('id', id)
          .single()

        if (!error) setDados(data)
        setLoading(false)
      }

      fetchData()
    }
  }, [id, router])

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Detalhes da Resposta</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : !dados ? (
          <p className="text-red-600">Formulário não encontrado.</p>
        ) : (
          <div className="bg-white p-4 rounded shadow space-y-4">
            <p><strong>Data:</strong> {new Date(dados.created_at).toLocaleString()}</p>
            <p><strong>Container:</strong> {dados.container_name} ({dados.location})</p>
            <p><strong>Responsável:</strong> {dados.email}</p>
            <p><strong>Tipo:</strong> {dados.role}</p>

            {dados.answers ? (
              <div>
                <h2 className="font-bold mt-4 mb-2">Respostas:</h2>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                {Object.entries(dados.answers || {}).map(([key, value]) => {
  const question = mockForm.find(q => q.id === key)

  return (
    <li key={key}>
      <strong>{question?.label ?? `Pergunta (${key})`}:</strong> {String(value) || 'Sem resposta'}
    </li>
  )
})}

                </ul>
              </div>
            ) : (
              <div>
                <h2 className="font-bold mt-4 mb-2">Comentário do auditor:</h2>
                <p className="italic text-gray-700">{dados.auditor_comment}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
