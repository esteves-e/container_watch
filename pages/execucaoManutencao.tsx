import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { isValidRole, Role } from '../lib/roles'

export default function ExecucaoManutencao() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hoje = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    responsavel: '',
    dataVerificacao: hoje,
    equipamento: '',
    status: '',
    avaria: 'Não',
    tipoAvaria: '',
    medidaCorretiva: '',
    tipoInspecao: '',
    itens: [] as string[],
    observacoes: '',
  })

  useEffect(() => {
    const localRole = localStorage.getItem('role')
    const localEmail = localStorage.getItem('email')

    if (!localEmail || !isValidRole(localRole)) {
      const fullPath = window.location.pathname + window.location.search
      localStorage.setItem('redirectAfterLogin', fullPath)
      router.replace('/login')
      return
    }

    setRole(localRole)
    setEmail(localEmail)

    const fetchName = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('email', localEmail)
        .single()

      if (data?.name) {
        setForm(prev => ({ ...prev, responsavel: data.name }))
      } else if (error) {
        console.error('Erro buscando nome:', error.message)
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

    if (!form.responsavel || !form.dataVerificacao || !form.equipamento || !form.status || !form.tipoInspecao) {
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
    const { error } = await supabase.from('execucao_manutencao').insert([{
      ...form,
      email,
      role,
    }])
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
          equipamento: '',
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
  const tiposInspecao = ['M1 (mensal)', 'M3 (trimestral)', 'M12 (anual)', 'MPO', 'Inspeção diária', 'Inspeção semanal', 'Outras']
  const itensInspecao = [
    'Inspeção visual do equipamento',
    'Inspeção do nível de combustível',
    'Inspeção do nível de óleo lubrificante',
    'Inspeção das conexões',
    'Inspeção dos pinos e travas',
    'Inspeção das válvulas',
    'Inspeção das roldanas de movimentação',
    'Inspeção de vazamentos',
    'Inspeção dos pneus (carro e carretinha)',
    'Inspecao dos mangotes  e conexoes',
    'Troca de óleo',
    'Troca de filtro de óleo',
    'Troca de filtro de combustível',
    'Troca de velas',
    'Limpeza do tanque de combustível',
    'Abastecimento do equipamento',
    'Teste de funcionamento 20min (motores)',
    'Montagem e teste do conjunto bomba e recolhedores',
    'Lubrificação das partes fixa e moveis',
    'Teste de rodagem e calibração dos pneus (carretinha)',
    'Limpeza e guarda do equipamento',
  ]

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Execução do Plano de Manutenção</h1>

        <div className="grid gap-4">
          <input name="responsavel" placeholder="Responsável pela manutenção" value={form.responsavel} onChange={handleChange} className="border p-2 rounded w-full" disabled />
          <input name="dataVerificacao" type="date" value={form.dataVerificacao} onChange={handleChange} className="border p-2 rounded w-full" required />
          <input name="equipamento" placeholder="Equipamento" value={form.equipamento} onChange={handleChange} className="border p-2 rounded w-full" required />

          <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded w-full" required>
            <option value="">Status do equipamento</option>
            {opcoesStatus.map(opt => <option key={opt}>{opt}</option>)}
          </select>

          <label className="font-medium">Avaria encontrada?</label>
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
                <option value="">Medidas tomadas</option>
                {['Corrigido', 'Não corrigido', 'Informado', 'Não informado'].map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </>
          )}

          <select name="tipoInspecao" value={form.tipoInspecao} onChange={handleChange} className="border p-2 rounded w-full" required>
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
    </>
  )
}
