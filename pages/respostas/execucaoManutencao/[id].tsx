import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Layout from '../../../components/layout'
import { formatarDataHoraBR } from '../../../lib/formatters'

export default function RespostaExecucaoManutencao() {
  const router = useRouter()
  const { id } = router.query
  const [form, setForm] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchForm = async () => {
      const { data, error } = await supabase
        .from('execucao_manutencao')
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

  const itens = form.itens || []

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Execução do Plano de Manutenção</h1>

        <div className="space-y-2">
          <p><strong>Responsável:</strong> {form.responsavel}</p>
          <p><strong>Data da Verificação:</strong> {formatarDataHoraBR(form.dataVerificacao)}</p>
          <p><strong>Equipamento:</strong> {form.equipamento}</p>
          <p><strong>Status:</strong> {form.status}</p>
          <p><strong>Avaria:</strong> {form.avaria}</p>
          {form.avaria === 'Sim' && (
            <>
              <p><strong>Tipo de Avaria:</strong> {form.tipoAvaria}</p>
              <p><strong>Medida Corretiva:</strong> {form.medidaCorretiva}</p>
            </>
          )}
          <p><strong>Tipo de Inspeção:</strong> {form.tipoInspecao}</p>
          <div>
            <p><strong>Itens Inspecionados:</strong></p>
            <ul className="list-disc ml-6">
              {itens.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <p><strong>Observações:</strong> {form.observacoes}</p>
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
