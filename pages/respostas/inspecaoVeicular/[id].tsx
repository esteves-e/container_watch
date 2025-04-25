import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Layout from '../../../components/layout'
import { formatarDataHoraBR } from '../../../lib/formatters'

export default function RespostaInspecaoVeicular() {
  const router = useRouter()
  const { id } = router.query
  const [form, setForm] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchForm = async () => {
      const { data, error } = await supabase
        .from('inspecao_veicular')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Erro ao carregar formulário: ' + error.message)
      } else {
        setForm(data)
      }
      setLoading(false)
    }

    fetchForm()
  }, [id])

  if (loading) return <Layout><p>Carregando...</p></Layout>
  if (!form) return <Layout><p>Formulário não encontrado.</p></Layout>

  const itens: string[] = form.itens || []

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Inspeção Diária de Veículos</h1>

        <div className="space-y-2">
          <p><strong>Responsável:</strong> {form.responsavel}</p>
          <p><strong>Data da Verificação:</strong> {formatarDataHoraBR(form.data_verificacao)}</p>
          <p><strong>Veículo:</strong> {form.veiculo}</p>
          <p><strong>Status:</strong> {form.status}</p>
          <p><strong>Avaria:</strong> {form.avaria}</p>
          {form.avaria === 'sim' && (
            <>
              <p><strong>Tipo de Avaria:</strong> {form.tipo_avaria}</p>
              <p><strong>Medidas Corretivas:</strong> {form.medidas_corretivas}</p>
            </>
          )}
          <p><strong>Tipo de Inspeção:</strong> {form.tipo_inspecao}</p>
          <div>
            <p><strong>Itens Inspecionados:</strong></p>
            <ul className="list-disc ml-6">
              {itens.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <p><strong>Observações:</strong> {form.observacao}</p>
        </div>

        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Voltar
        </button>
      </div>
    </Layout>
  )
}
