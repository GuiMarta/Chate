import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import imagem from '../assets/AAA.png'; // Ajuste o caminho da imagem conforme necessário

function Chat() {
  const { salaId } = useParams(); // Recupera o id da sala da URL
  const [salas, setSalas] = useState<any[]>([]);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [novaMensagem, setNovaMensagem] = useState(""); // Estado para a nova mensagem

  // Recupera o token e o nick armazenados no localStorage
  const nickUsuario = localStorage.getItem('nick') || "Usuário";
  const token = localStorage.getItem('token') || "";

  // Busca todas as salas assim que o componente for montado
  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/salas');
        setSalas(response.data); // Salva todas as salas
        setLoading(false); // Atualiza o estado de loading
      } catch (error) {
        console.error('Erro ao buscar salas:', error);
        setLoading(false);
      }
    };

    fetchSalas();
  }, []);

  // Atualiza as mensagens sempre que a sala for alterada
  useEffect(() => {
    if (salaId && salas.length > 0) {
      const sala = salas.find((s) => s._id === salaId); // Encontra a sala com o id correspondente
      if (sala) {
        setMensagens(sala.msgs); // Atualiza as mensagens com as da sala encontrada
      }
    }
  }, [salaId, salas]);

  // Função para buscar novas mensagens a cada 2 segundos
  useEffect(() => {
    if (!salaId) return;

    const fetchMensagens = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/sala/${salaId}/mensagens`, {
          headers: {
            'token': token,
          },
        });
        // Verifica se há novas mensagens
        if (JSON.stringify(mensagens) !== JSON.stringify(response.data)) {
          setMensagens(response.data); // Atualiza as mensagens
        }
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      }
    };

    const interval = setInterval(() => {
      fetchMensagens(); // Chama a função de busca de mensagens
    }, 2000); // 2 segundos

    // Busca as mensagens imediatamente quando a sala for carregada
    fetchMensagens();

    // Limpa o intervalo quando o componente for desmontado ou o `salaId` mudar
    return () => clearInterval(interval);
  }, [salaId, token, mensagens]); // A dependência inclui mensagens para comparar novas mensagens com as antigas

  // Função para formatar a data
  const formatarData = (timestamp: number) => {
    const data = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(data);
  };

  // Função para enviar a mensagem
  const enviarMensagem = async () => {
    if (novaMensagem.trim()) {
      const novaMsg = {
        msg: novaMensagem,
        idSala: salaId, // Passa o id da sala
      };

      try {
        // Envia a mensagem para a API com o token e o nick como headers
        const response = await axios.post(
          'http://localhost:5000/sala/mensagem',
          novaMsg,
          {
            headers: {
              'token': token, // Passa o token no header Authorization
              'nick': nickUsuario, // Passa o nick como um header adicional
            },
          }
        );

        // Verifica se a resposta foi bem-sucedida
        if (response.status === 200) {
          // Atualiza as mensagens com a nova mensagem da API
          setMensagens([...mensagens, { ...novaMsg, timestamp: Date.now(), nick: nickUsuario }]);
          setNovaMensagem(""); // Limpa o campo de entrada
        }
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
      }
    }
  };

  // Contar o número de usuários únicos
  const contarUsuariosUnicos = () => {
    const usuarios = new Set(mensagens.map((msg) => msg.nick));
    return usuarios.size;
  };

  if (loading) {
    return <div>Carregando salas...</div>;
  }

  const sala = salas.find((s) => s._id === salaId); // Encontra a sala com base no ID
  const nomeSala = sala ? sala.nome : 'Sala desconhecida'; // Exibe o nome da sala

  return (
    <div className="flex justify-center items-center min-h-screen  bg-gradient-to-b from-indigo-900 to-indigo-600">
  <div className="w-full max-w-2xl bg-gray-800 rounded-3xl shadow-xl p-6">
    
    {/* Título e contador de usuários */}
    <div className="flex justify-between items-center mb-6 ">
      <div className="flex-1 text-center py-2 px-6 bg-white text-black rounded-full shadow-md mr-5">
        <p className="font-medium text-xl">{nomeSala}</p>
      </div>
      <div className="flex justify-center items-center w-14 h-14 bg-white rounded-full shadow-lg">
        <p className="text-2xl font-semibold">{contarUsuariosUnicos()}</p>
      </div>
    </div>

    {/* Mensagens */}
    <div
      className="flex flex-col w-full h-80 bg-gray-700 rounded-2xl p-5 overflow-y-scroll"
      style={{ maxHeight: '350px' }}
    >
      {mensagens.length === 0 ? (
        <div className="text-center text-gray-300">Nenhuma mensagem ainda.</div>
      ) : (
        mensagens.map((mensagem, index) => (
          <div
            key={index}
            className={`mb-4 p-4 rounded-lg ${mensagem.nick === nickUsuario ? "bg-blue-600 text-right" : "bg-gray-600 text-left"} text-white shadow-lg`}
          >
            <p className="font-semibold">{mensagem.nick}</p>
            <p>{mensagem.msg}</p>
            <p className="text-xs text-gray-400">{formatarData(mensagem.timestamp)}</p>
          </div>
        ))
      )}
    </div>

    {/* Input de nova mensagem */}
    <div className="flex items-center justify-between mt-6">
      <input
        className="w-full h-12 bg-transparent border-2 border-gray-500 text-white rounded-lg px-4 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        value={novaMensagem}
        onChange={(e) => setNovaMensagem(e.target.value)} // Atualiza o estado da nova mensagem
        placeholder="Digite sua mensagem..."
      />
      <button
        className="ml-4 h-16 w-20 rounded-full bg-white text-black font-semibold shadow-xl hover:bg-blue-700 transition duration-200"
        onClick={enviarMensagem} // Envia a mensagem ao clicar
      >
        Enviar
      </button>
    </div>
  </div>
</div>



  );
}

export default Chat;
