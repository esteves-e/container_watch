import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { Role, isValidRole } from '../lib/roles'

export default function InspecaoVeicularPage() {
  const router = useRouter()
  const hoje = new Date().toISOString().split('T')[0]
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  const [form, setForm] = useState({
    responsavel: '',
    dataVerificacao: hoje,
    veiculo: '',
    status: '',
    avaria: 'Não',
    tipoAvaria: '',
    medidasCorretivas: '',
    tipoInspecao: '',
    itens: [] as string[],
    observacao: '',
  })

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

    setRole(storedRole as Role)
    setEmail(storedEmail)

    const fetchName = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .ilike('email', storedEmail)
        .single()

      if (data?.name) {
        setForm(prev => ({ ...prev, responsavel: data.name }))
      } else {
        console.warn('Nome não encontrado para este email.')
        setForm(prev => ({ ...prev, responsavel: '[Nome não encontrado]' }))
      }
    }

    fetchName()
  }, [])

  const toggleItem = (item: string) => {
    setForm(prev => ({
      ...prev,
      itens: prev.itens.includes(item)
        ? prev.itens.filter(i => i !== item)
        : [...prev.itens, item],
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!email || !role) return

    if (!form.responsavel || !form.dataVerificacao || !form.veiculo || !form.status || !form.tipoInspecao) {
      return toast.error('Preencha os campos obrigatórios!')
    }

    const ano = parseInt(form.dataVerificacao.split('-')[0])
    if (ano < 2000 || ano > new Date().getFullYear() + 1) {
      toast.error('Data inválida!')
      return
    }

    if (form.avaria === 'Sim') {
      if (!form.tipoAvaria || !form.medidasCorretivas) {
        toast.error('Descreva o tipo de avaria e a medida corretiva.')
        return
      }
    }

    const { error } = await supabase.from('inspecao_veicular').insert({
      responsavel: form.responsavel,
      data_verificacao: form.dataVerificacao,
      veiculo: form.veiculo,
      status: form.status,
      avaria: form.avaria,
      tipo_avaria: form.tipoAvaria,
      medidas_corretivas: form.medidasCorretivas,
      tipo_inspecao: form.tipoInspecao,
      itens: form.itens,
      observacao: form.observacao,
      email,
      role
    })

    if (error) {
      toast.error('Erro ao enviar: ' + error.message)
    } else {
      toast.success('Formulário enviado com sucesso!')
      if (role === 'gerente') {
        router.push('/respostas')
      } else {
        setForm({
          responsavel: form.responsavel,
          dataVerificacao: hoje,
          veiculo: '',
          status: '',
          avaria: 'Não',
          tipoAvaria: '',
          medidasCorretivas: '',
          tipoInspecao: '',
          itens: [],
          observacao: ''
        })
        router.replace(router.asPath)
      }
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-4">Inspeção Diária de Veículos</h1>

      <label className="block font-medium mb-1">Responsável *</label>
      <input className="border p-2 w-full rounded mb-3" name="responsavel" value={form.responsavel} onChange={handleChange} disabled />

      <label className="block font-medium mb-1">Data da Verificação *</label>
      <input type="date" className="border p-2 w-full rounded mb-3" name="dataVerificacao" value={form.dataVerificacao} onChange={handleChange} />

      <label className="block font-medium mb-1">Identificação do Veículo *</label>
      <input className="border p-2 w-full rounded mb-3" name="veiculo" value={form.veiculo} onChange={handleChange} />

      <label className="block font-medium mb-1">Status *</label>
      <select className="border p-2 w-full rounded mb-3" name="status" value={form.status} onChange={handleChange}>
        <option value="">Selecione</option>
        <option value="O">Operacional</option>
        <option value="N/O">Não operacional</option>
        <option value="Em uso">Em uso</option>
      </select>

      <label className="block font-medium mb-1">Avarias encontradas?</label>
      <select className="border p-2 w-full rounded mb-3" name="avaria" value={form.avaria} onChange={handleChange}>
        <option value="Não">Não</option>
        <option value="Sim">Sim</option>
      </select>

      {form.avaria === 'Sim' && (
        <>
          <label className="block font-medium mb-1">Tipo de Avaria</label>
          <input className="border p-2 w-full rounded mb-3" name="tipoAvaria" value={form.tipoAvaria} onChange={handleChange} />

          <label className="block font-medium mb-1">Medidas Corretivas</label>
          <input className="border p-2 w-full rounded mb-3" name="medidasCorretivas" value={form.medidasCorretivas} onChange={handleChange} />
        </>
      )}

      <label className="block font-medium mb-1">Tipo de inspeção *</label>
      <input className="border p-2 w-full rounded mb-3" name="tipoInspecao" value={form.tipoInspecao} onChange={handleChange} />

      <label className="block font-medium mb-1">Itens Inspecionados</label>
      <div className="grid grid-cols-1 gap-2 mb-3">
        {itemOptions.map((item) => (
          <label key={item} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.itens.includes(item)}
              onChange={() => toggleItem(item)}
            />
            {item}
          </label>
        ))}
      </div>

      <label className="block font-medium mb-1">Observações</label>
      <textarea className="border p-2 w-full rounded mb-3" rows={3} name="observacao" value={form.observacao} onChange={handleChange} />

      <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        {loading ? 'Enviando...' : 'Enviar formulário'}
      </button>
    </div>
  )
}

export {}
