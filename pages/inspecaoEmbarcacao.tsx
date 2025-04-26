import { useRouter } from 'next/router'
import { toast, ToastContainer } from 'react-toastify'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Role, isValidRole } from '../lib/roles'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function InspecaoEmbarcacao() {
  const router = useRouter()
  const hoje = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    responsavel: '',
    dataVerificacao: hoje,
    embarcacao: '',
    status: '',
    avaria: 'Não',
    tipoAvaria: '',
    medidaCorretiva: '',
    tipoInspecao: '',
    itens: [] as string[],
    observacoes: '',
  })
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    const storedEmail = localStorage.getItem('email')
    const storedRole = localStorage.getItem('role')
    if (!storedEmail || !isValidRole(storedRole)) {
      const fullPath = window.location.pathname + window.location.search
      localStorage.setItem('redirectAfterLogin', fullPath)
      router.replace('/login')
      return
    }
    setEmail(storedEmail)
    setRole(storedRole as Role)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (item: string) => {
    setForm(prev => ({
      ...prev,
      itens: prev.itens.includes(item)
        ? prev.itens.filter(i => i !== item)
        : [...prev.itens, item],
    }))
  }

  const handleSubmit = async () => {
    if (!email || !role) return

    if (!form.responsavel || !form.dataVerificacao || !form.embarcacao || !form.status || !form.tipoInspecao) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }

    const ano = parseInt(form.dataVerificacao.split('-')[0])
    if (ano < 2000 || ano > new Date().getFullYear() + 1) {
      toast.error('Data inválida!')
      return
    }

    if (form.avaria === 'Sim') {
      if (!form.tipoAvaria || !form.medidaCorretiva) {
        toast.error('Descreva o tipo de avaria e a medida corretiva.')
        return
      }
    }

    setLoading(true)
    const { error } = await supabase.from('inspecao_diaria_embarcacao').insert([{ ...form, email, role }])
    setLoading(false)

    if (error) {
      toast.error('Erro ao salvar: ' + error.message)
    } else {
      toast.success('Formulário enviado com sucesso!')
      if (role === 'gerente') {
        router.push('/respostas')
      } else {
        setForm({
          responsavel: form.responsavel,
          dataVerificacao: hoje,
          embarcacao: '',
          status: '',
          avaria: 'Não',
          tipoAvaria: '',
          medidaCorretiva: '',
          tipoInspecao: '',
          itens: [],
          observacoes: ''
        })
        router.replace(router.asPath)
      }
    }
  }

  const opcoesStatus = ['O - Operacional', 'N/O - Não operacional', 'Em uso']
  const tiposInspecao = ['M1 (mensal)', 'M3 (trimestral)', 'M12 (Anual)', 'MPO (manutenção pós operação)', 'inspeção diária', 'Inspeção semanal', 'Outras']
  const itensInspecao = [
    'Inspeção visual do barco (estado geral)',
    'Inspeção do nível de combustível',
    'Inspeção do hélice (motor de popa)',
    'Inspeção do nível de óleo lubrificante',
    'Inspeção do Liquido de arrefecimento',
    'Teste de funcionamento das luzes de navegação',
    'Teste bomba de porão',
    'Teste de leme',
    'Inspeção de vazamentos',
    'Inspeção de itens de segurança (Palamenta)',
    'Inspeção dos instrumentos do painel',
    'Inspeção da estrutura de guarda corpo',
    'Limpeza do casco',
    'Adoçamento do motor (motor de popa)',
    'Troca de vela (vide PM ou indicado pelo fabricante)',
    'Limpeza do tanque de combustível',
    'Teste de funcionamento 20 min',
    'Teste de navegação 40 min (HDG 25)',
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-4">Inspeção Diária de Embarcação</h1>

      <div className="grid gap-4">
        <input name="responsavel" placeholder="Responsável" value={form.responsavel} onChange={handleChange} className="border p-2 rounded w-full" disabled />
        <input name="dataVerificacao" type="date" value={form.dataVerificacao} onChange={handleChange} className="border p-2 rounded w-full" />
        <input name="embarcacao" placeholder="Identificação da embarcação" value={form.embarcacao} onChange={handleChange} className="border p-2 rounded w-full" />

        <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="">Status da embarcação</option>
          {opcoesStatus.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <label className="font-medium">Alguma avaria encontrada?</label>
        <div className="flex gap-4">
          {['Sim', 'Não'].map(opt => (
            <label key={opt} className="flex items-center gap-1">
              <input type="radio" name="avaria" value={opt} checked={form.avaria === opt} onChange={handleChange} />
              {opt}
            </label>
          ))}
        </div>

        {form.avaria === 'Sim' && (
          <>
            <input name="tipoAvaria" placeholder="Tipo de avaria" value={form.tipoAvaria} onChange={handleChange} className="border p-2 rounded w-full" />
            <select name="medidaCorretiva" value={form.medidaCorretiva} onChange={handleChange} className="border p-2 rounded w-full">
              <option value="">Medida corretiva</option>
              {['Corrigido', 'Não corrigido', 'Informado', 'Não informado'].map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </>
        )}

        <select name="tipoInspecao" value={form.tipoInspecao} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="">Tipo de inspeção</option>
          {tiposInspecao.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <fieldset className="border rounded p-4">
          <legend className="font-medium">Itens Inspecionados:</legend>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {itensInspecao.map(item => (
              <label key={item} className="flex items-center gap-2">
                <input type="checkbox" checked={form.itens.includes(item)} onChange={() => handleCheckboxChange(item)} />
                {item}
              </label>
            ))}
          </div>
        </fieldset>

        <textarea name="observacoes" rows={4} placeholder="Observações" value={form.observacoes} onChange={handleChange} className="border p-2 rounded w-full" />

        <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? 'Enviando...' : 'Enviar formulário'}
        </button>
      </div>
    </div>
  )
}
