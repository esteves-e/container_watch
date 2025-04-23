
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Role, isValidRole } from '../lib/roles'

const mockForm = [
  { id: 'q1', label: 'Equipamento está funcionando corretamente?', type: 'boolean' },
  { id: 'q2', label: 'Há sinais de vazamento?', type: 'boolean' },
  { id: 'q3', label: 'Temperatura interna (°C)', type: 'number' },
  { id: 'q4', label: 'Umidade interna (%)', type: 'number' },
  { id: 'q5', label: 'Porta está selando corretamente?', type: 'boolean' },
  { id: 'q6', label: 'Ruídos anormais detectados?', type: 'boolean' },
  { id: 'q7', label: 'Limpeza está em dia?', type: 'boolean' },
  { id: 'q8', label: 'Nível de combustível/energia', type: 'text' },
  { id: 'q9', label: 'Observações do técnico', type: 'text' },
  { id: 'q10', label: 'Checklist adicional (se houver)', type: 'text' }
]

export default function ContainerFormPage() {
  const router = useRouter()
  const { id, name, location } = router.query

  const [role, setRole] = useState<Role | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [containerName, setContainerName] = useState('')
  const [containerLocation, setContainerLocation] = useState('')

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

    if (typeof name === 'string') setContainerName(name)
    if (typeof location === 'string') setContainerLocation(location)
  }, [name, location, router])

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  const handleClearForm = () => {
    setAnswers({})
  }

  const handleSubmit = async () => {
    if (!email) return alert("Usuário não autenticado.")
    if (Object.keys(answers).length === 0) {
      return alert('Preencha o formulário antes de enviar.')
    }

    const { error } = await supabase.from('form_responses').insert([
      {
        container_id: id,
        container_name: containerName,
        container_location: containerLocation,
        answers,
        submitted_by: email,
        created_at: new Date().toISOString(),
      }
    ])

    if (error) {
      alert('Erro ao enviar: ' + error.message)
    } else {
      alert('Formulário enviado com sucesso!')
      router.push('/models')
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Checklist de Container</h1>
      {mockForm.map((q) => (
        <div key={q.id} className="mb-4">
          <label className="block font-medium mb-1">{q.label}</label>
          {q.type === 'boolean' ? (
            <select
              className="border p-2 rounded w-full"
              value={answers[q.id] || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          ) : (
            <input
              type={q.type}
              className="border p-2 rounded w-full"
              value={answers[q.id] || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={handleClearForm}
          className="bg-gray-300 text-black px-6 py-3 rounded hover:bg-gray-400 transition"
        >
          Limpar formulário
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Finalizar Formulário
        </button>
      </div>
    </div>
  )
}
