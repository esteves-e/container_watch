import React from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Role, isValidRole } from '../lib/roles'

export default function InspecaoVeicularPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  const [responsavel, setResponsavel] = useState('')
  const [dataVerificacao, setDataVerificacao] = useState('')
  const [veiculo, setVeiculo] = useState('')
  const [status, setStatus] = useState('')
  const [avaria, setAvaria] = useState('nao')
  const [tipoAvaria, setTipoAvaria] = useState('')
  const [medidasCorretivas, setMedidasCorretivas] = useState('')
  const [tipoInspecao, setTipoInspecao] = useState('')
  const [itens, setItens] = useState<string[]>([])
  const [observacao, setObservacao] = useState('')

  const itemOptions = [
    "Inspeção visual do veículo",
    "Inspeção do nível de combustível",
    "Inspeção do nível de óleo lubrificante",
    "Inspeção do Liquido de arrefecimento",
    "Inspeção do fluido de freio",
    "Inspeção da água do parabrisa",
    "Teste de funcionamento das luzes de sinalização",
    "Testes do Limpador de parabrisa",
    "Inspeção de vazamentos",
    "Inspeção dos pneus (estado)",
    "Inspeção dos instrumentos do painel",
    "Teste de rodagem e calibração dos pneus",
    "Troca de óleo (vide PM ou recomendado pelo fabricante)",
    "Troca de filtro de óleo (vide PM)",
    "Troca de filtro de combustível (vide PM)",
    "Troca do filtro de ar (vide PM)",
    "Limpeza do veículo"
  ]

  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    const storedEmail = localStorage.getItem('email')

    if (!storedEmail || !isValidRole(storedRole)) {
      const fullPath = window.location.pathname + window.location.search
      localStorage.setItem('redirectAfterLogin', fullPath)
      router.replace('/login')
      return
    }

    setRole(storedRole)
    setEmail(storedEmail)
  }, [])

  const toggleItem = (item: string) => {
    setItens(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const handleSubmit = async () => {
    if (!responsavel || !dataVerificacao || !veiculo || !status) {
      return alert('Preencha os campos obrigatórios!')
    }

    const { error } = await supabase.from('inspecao_veicular').insert({
      responsavel,
      data_verificacao: dataVerificacao,
      veiculo,
      status,
      avaria,
      tipo_avaria: tipoAvaria,
      medidas_corretivas: medidasCorretivas,
      tipo_inspecao: tipoInspecao,
      itens,
      observacao,
      email,
      role
    })

    if (error) {
      alert('Erro ao enviar: ' + error.message)
    } else {
      alert('Formulário enviado com sucesso!')
      router.push('/containers')
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Inspeção Diária de Veículos</h1>

      <label className="block font-medium mb-1">Responsável *</label>
      <input className="border p-2 w-full rounded mb-3" value={responsavel} onChange={e => setResponsavel(e.target.value)} />

      <label className="block font-medium mb-1">Data da Verificação *</label>
      <input type="date" className="border p-2 w-full rounded mb-3" value={dataVerificacao} onChange={e => setDataVerificacao(e.target.value)} />

      <label className="block font-medium mb-1">Identificação do Veículo *</label>
      <input className="border p-2 w-full rounded mb-3" value={veiculo} onChange={e => setVeiculo(e.target.value)} />

      <label className="block font-medium mb-1">Status *</label>
      <select className="border p-2 w-full rounded mb-3" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">Selecione</option>
        <option value="O">Operacional</option>
        <option value="N/O">Não operacional</option>
        <option value="Em uso">Em uso</option>
      </select>

      <label className="block font-medium mb-1">Avarias encontradas?</label>
      <select className="border p-2 w-full rounded mb-3" value={avaria} onChange={e => setAvaria(e.target.value)}>
        <option value="nao">Não</option>
        <option value="sim">Sim</option>
      </select>

      {avaria === 'sim' && (
        <>
          <label className="block font-medium mb-1">Tipo de Avaria</label>
          <input className="border p-2 w-full rounded mb-3" value={tipoAvaria} onChange={e => setTipoAvaria(e.target.value)} />

          <label className="block font-medium mb-1">Medidas Corretivas</label>
          <input className="border p-2 w-full rounded mb-3" value={medidasCorretivas} onChange={e => setMedidasCorretivas(e.target.value)} />
        </>
      )}

      <label className="block font-medium mb-1">Tipo de inspeção *</label>
      <input className="border p-2 w-full rounded mb-3" value={tipoInspecao} onChange={e => setTipoInspecao(e.target.value)} />

      <label className="block font-medium mb-1">Itens Inspecionados</label>
      <div className="grid grid-cols-1 gap-2 mb-3">
        {itemOptions.map((item) => (
          <label key={item} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={itens.includes(item)}
              onChange={() => toggleItem(item)}
            />
            {item}
          </label>
        ))}
      </div>

      <label className="block font-medium mb-1">Observações</label>
      <textarea className="border p-2 w-full rounded mb-3" rows={3} value={observacao} onChange={e => setObservacao(e.target.value)} />

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Enviar formulário
      </button>
    </div>
  )
}
export {} // força o TypeScript a tratar como módulo

