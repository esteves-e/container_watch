import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import Layout from '../components/layout'
import { useRouter } from 'next/router'
import { toPng } from 'html-to-image'
import { supabase } from '../lib/supabase'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Container {
  id: string
  name: string
  location: string
  form_type: string
}

const formatFormTypeLabel = (formType: string) => {
  const map: Record<string, string> = {
    execucaoManutencao: 'Execução de Manutenção',
    inspecaoVeicular: 'Inspeção Veicular',
    inspecaoEmbarcacao: 'Inspeção de Embarcação',
    containerForm: 'Checklist Container',
  }
  return map[formType] || formType
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

export default function Dashboard() {
  const [containers, setContainers] = useState<Container[]>([])
  const [formResponses, setFormResponses] = useState<any[]>([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [formType, setFormType] = useState('containerForm')
  const [role, setRole] = useState<string | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [loading, setLoading] = useState(true) // 🔥 Loading containers
  const qrRef = useRef(null)
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // role & email
  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    const storedEmail = localStorage.getItem('email')
    if (storedRole !== 'gerente') {
      router.push('/login')
    }
    setRole(storedRole)
    setUserEmail(storedEmail)
  }, [])

  // containers
  useEffect(() => {
    const fetchContainers = async () => {
      const { data, error } = await supabase
        .from('containers')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        toast.error('Erro ao buscar containers: ' + error.message)
      } else if (data) {
        setContainers(data)
      }
      setLoading(false)
    }

    fetchContainers()
  }, [])

  // formulário resposta
  useEffect(() => {
    const fetchForms = async () => {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setFormResponses(data)
    }

    fetchForms()
  }, [])

  const handleAddContainer = async () => {
    if (!name) return toast.error('Nome é obrigatório!')

    const newContainer: Container = {
      id: Math.random().toString(36).substring(2, 10),
      name,
      location,
      form_type: formType,
    }

    const { error } = await supabase.from('containers').insert([newContainer])
    if (error) {
      toast.error("Erro ao salvar no banco: " + error.message)
      return
    }

    setContainers(prev => [...prev, newContainer])
    setName('')
    setLocation('')
    setFormType('containerForm')
    toast.success('Container criado com sucesso!')
  }

  const handleDeleteContainer = async (id: string) => {
    const confirmed = window.confirm("Deseja realmente excluir este container?")
    if (!confirmed) return

    const { error } = await supabase.from('containers').delete().eq('id', id)
    if (error) {
      toast.error("Erro ao excluir: " + error.message)
      return
    }

    setContainers(prev => prev.filter(c => c.id !== id))
    toast.success('Container excluído com sucesso!')
  }

  const handleDownload = () => {
    if (qrRef.current) {
      toPng(qrRef.current).then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${selectedContainer?.name || 'qrcode'}.png`
        link.href = dataUrl
        link.click()
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/login')
  }

  return (
    <Layout>
      <ToastContainer position="top-center" autoClose={3000} /> {/* Toast configurado */}

      {selectedContainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm text-center relative">
            <h2 className="text-lg font-bold mb-4">{selectedContainer.name}</h2>
            <div ref={qrRef} className="p-4 bg-white inline-block rounded">
              <QRCode
                value={`${baseUrl}/${selectedContainer.form_type}?id=${selectedContainer.id}`}
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '256px' }}
              />
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Baixar QR Code
              </button>
              <button onClick={() => setSelectedContainer(null)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full">
        {role === 'gerente' && (
          <div className="bg-white rounded-xl shadow-md p-4 border mb-6">
            <h2 className="text-lg font-semibold mb-2">Criar novo container</h2>
            <input
              type="text"
              placeholder="Nome do container"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="text"
              placeholder="Localização (opcional)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            />
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="border p-2 w-full rounded mb-4"
            >
              <option value="">Selecione o tipo de formulário</option>
              <option value="execucaoManutencao">Execução de Manutenção</option>
              <option value="inspecaoVeicular">Inspeção Veicular</option>
              <option value="inspecaoEmbarcacao">Inspeção de Embarcação</option>
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
              onClick={handleAddContainer}
            >
              Adicionar container
            </button>
          </div>
        )}

        {/* 🔵 Loading enquanto busca containers */}
        {loading ? (
          <div className="text-center text-gray-600 py-10">
            Carregando containers...
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-3">Containers cadastrados</h2>
            <div className="space-y-4">
              {containers.map(container => (
                <div key={container.id} className="border rounded-xl p-4 shadow-sm bg-white">
                  <h3 className="text-md font-bold">{container.name}</h3>
                  {container.location && (
                    <p className="text-sm text-gray-600">Local: {container.location}</p>
                  )}
                  <p className="text-sm text-gray-600">Tipo de formulário: {formatFormTypeLabel(container.form_type)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Link
                      href={{
                        pathname: `/${container.form_type}`,
                        query: {
                          id: container.id,
                          name: container.name,
                          location: container.location,
                        },
                      }}
                      className="text-blue-600 underline text-sm"
                    >
                      Acessar formulário
                    </Link>
                    <div className="flex items-center gap-3">
                      <div
                        className="cursor-pointer"
                        onClick={() => setSelectedContainer(container)}
                      >
                        <QRCode
                          value={`${baseUrl}/${container.form_type}?id=${container.id}`}
                          size={64}
                          style={{ height: 'auto', maxWidth: '100%', width: '64px' }}
                        />
                      </div>
                      {role === 'gerente' && (
                        <button
                          onClick={() => handleDeleteContainer(container.id)}
                          className="text-red-600 text-sm underline"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
