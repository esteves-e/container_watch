import { useEffect, useState, Fragment } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout'
import Link from 'next/link'
import { formatarDataHoraBR } from '../lib/formatters'
import { Dialog, Transition } from '@headlessui/react'

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
  origem?: string
}

const labelMap: Record<string, string> = {
  inspecaoVeicular: 'Inspeção Veicular',
  execucaoManutencao: 'Execução de Manutenção',
  inspecaoEmbarcacao: 'Inspeção de Embarcação'
}

const origemMap: Record<string, string> = {
  inspecao_veicular: 'inspecaoVeicular',
  execucao_manutencao: 'execucaoManutencao',
  inspecao_diaria_embarcacao: 'inspecaoEmbarcacao'
}

export default function ListaRespostas() {
  const [respostas, setRespostas] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedOrigem, setSelectedOrigem] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'gerente') {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      const tabelas = ['inspecao_veicular', 'execucao_manutencao', 'inspecao_diaria_embarcacao']
      const todasRespostas: FormResponse[] = []

      for (const tabela of tabelas) {
        const { data, error } = await supabase.from(tabela).select('*').order('created_at', { ascending: false })
        if (!error && data) {
          todasRespostas.push(...data.map((item: any) => ({
            ...item,
            tipoInspecao: item.tipoInspecao || '-',
            origem: origemMap[tabela]
          })))
        }
      }

      setRespostas(todasRespostas)
      setLoading(false)
    }

    fetchData()
  }, [router])

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
                <p className="text-sm text-gray-600">{formatarDataHoraBR(resp.created_at)}</p>
                <p className="text-sm">Veículo/Equipamento: {resp.veiculo || resp.equipamento || resp.embarcacao || '—'}</p>
                <p className="text-sm">Localização: {resp.location || '—'}</p>
                <p className="text-sm">Tipo de Inspeção: {resp.tipoInspecao || '—'}</p>
                <p className="text-sm">Origem: {labelMap[resp.origem ?? ''] || 'Desconhecido'}</p>
                <p className="text-sm">E-mail: {resp.email}</p>
                <div className="mt-2 flex gap-4">
                  <Link
                    href={`/respostas/${resp.origem}/${resp.id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Ver detalhes
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedId(resp.id)
                      setSelectedOrigem(resp.origem || 'inspecaoVeicular')
                      setShowModal(true)
                    }}
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

      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm sm:max-w-xs">
                <Dialog.Title className="text-lg font-bold mb-4">Confirmar Exclusão</Dialog.Title>
                <p className="mb-4 text-sm text-gray-600">Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita.</p>

                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={async () => {
                      if (selectedId && selectedOrigem) {
                        const tabelaOriginal = Object.keys(origemMap).find(key => origemMap[key] === selectedOrigem) || 'inspecao_veicular'
                        await supabase.from(tabelaOriginal).delete().eq('id', selectedId)
                        setRespostas(prev => prev.filter(r => r.id !== selectedId))
                        setShowModal(false)
                      }
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </Layout>
  )
} 