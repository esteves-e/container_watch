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
  const [auditorComment, setAuditorComment] = useState('')
  const [containerName, setContainerName] = useState('')
  const [containerLocation, setContainerLocation] = useState('')

  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    const storedEmail = localStorage.getItem('email')

    if (!storedEmail || !isValidRole(storedRole)) {
      router.push('/login')
      return
    }

    setRole(storedRole)
    setEmail(storedEmail)

    if (typeof name === 'string') setContainerName(name)
    if (typeof location === 'string') setContainerLocation(location)
  }, [router.query])

  const handleChange = (qid: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qid]: value }))
  }

  const handleClearForm = () => setAnswers({})

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      return alert('Preencha o formulário antes de enviar.')
    }

    const { error } = await supabase.from('form_responses').insert({
      container_id: id,
      container_name: containerName,
      location: containerLocation,
      role,
      email,
      answers,
      auditor_comment: null,
    })

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      alert('Formulário enviado com sucesso!')
      router.push('/containers')
    }
  }

  const handleAuditorSubmit = async () => {
    if (!auditorComment.trim()) {
      return alert('Insira um comentário antes de enviar.')
    }

    const { error } = await supabase.from('form_responses').insert({
      container_id: id,
      container_name: containerName,
      location: containerLocation,
      role,
      email,
      answers: null,
      auditor_comment: auditorComment,
    })

    if (error) {
      alert('Erro ao salvar comentário: ' + error.message)
    } else {
      alert('Comentário enviado com sucesso!')
      router.push('/containers')
    }
  }

  if (!id || typeof id !== 'string') return null

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Checklist do Container</h1>
        <p className="text-gray-600 text-sm mt-1">
          <strong>Nome:</strong> {containerName || '—'}<br />
          <strong>Localização:</strong> {containerLocation || '—'}
        </p>
      </div>

      <form className="space-y-5">
        {mockForm.map((q) =>
          role === 'tecnico' || role === 'gerente' ? (
            <div key={q.id}>
              <label className="block font-medium text-gray-700">{q.label}</label>
              {q.type === 'boolean' ? (
                <div className="flex gap-2 mt-2">
                  {['sim', 'nao'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleChange(q.id, val)}
                      className={`px-4 py-2 rounded border 
                        ${answers[q.id] === val ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
                    >
                      {val === 'sim' ? 'Sim' : 'Não'}
                    </button>
                  ))}
                </div>
              ) : q.type === 'number' ? (
                <input
                  type="number"
                  value={answers[q.id] || ''}
                  className="border border-gray-300 p-2 w-full rounded mt-2"
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              ) : (
                <textarea
                  value={answers[q.id] || ''}
                  className="border border-gray-300 p-2 w-full rounded mt-2"
                  rows={2}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}
            </div>
          ) : (
            <div key={q.id} className="bg-gray-50 p-4 rounded shadow-sm">
              <label className="block font-semibold text-gray-700 mb-1">{q.label}</label>
              <p className={`italic ${answers[q.id] ? 'text-gray-800' : 'text-gray-400'}`}>
                {answers[q.id] || 'Sem resposta'}
              </p>
            </div>
          )
        )}

        {(role === 'tecnico' || role === 'gerente') && (
          <div className="flex justify-end gap-4 mt-4">
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
        )}

        {role === 'auditor' && (
          <div className="bg-white p-4 mt-6 rounded shadow-md">
            <label className="block font-semibold text-gray-700 mb-2">Comentário do auditor:</label>
            <textarea
              className="border border-gray-300 rounded p-2 w-full"
              rows={3}
              value={auditorComment}
              onChange={(e) => setAuditorComment(e.target.value)}
            />
            <div className="text-right">
              <button
                type="button"
                onClick={handleAuditorSubmit}
                className="mt-3 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Enviar comentário
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
