import  { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import imagem from '../assets/AAA.png'; // Imagem de fundo

function Home() {
  const [salas, setSalas] = useState<any[]>([]); // Para armazenar as salas
  const [loading, setLoading] = useState(true); // Para exibir um indicador de carregamento
  const navigate = useNavigate();

  // Função para buscar as salas da API
  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/salas");
        setSalas(response.data);
        setLoading(false); // Atualiza o estado de loading quando as salas forem carregadas
      } catch (error) {
        console.error('Erro ao buscar salas:', error);
        setLoading(false); // Ainda desabilita o loading mesmo que ocorra um erro
      }
    };

    fetchSalas();
  }, []);

  // Função para navegar para a sala específica
  const entrarNaSala = (salaId: string) => {
    navigate(`/chat/${salaId}`);
  };

  // Exibindo um loading enquanto as salas estão sendo carregadas
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Carregando salas...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-600 p-8">
  <div className="w-full max-w-4xl h-[85%] bg-gray-800 rounded-lg shadow-2xl p-8 overflow-hidden">
    
    {/* Título e contador de salas */}
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center bg-gradient-to-r from-green-500 to-blue-500 px-6 py-2 rounded-lg shadow-md">
        <p className="text-white font-bold text-xl">SALAS</p>
      </div>
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-xl">
        <p className="text-white font-semibold text-lg">{salas.length}</p>
      </div>
    </div>
    
    {/* Lista de salas */}
    <div className="space-y-6">
      {salas.length === 0 ? (
        <div className="text-center text-white text-lg">Nenhuma sala disponível</div>
      ) : (
        salas.map((sala) => {
          const ultimaMsg = sala.msgs[sala.msgs.length - 1];
          const ultimaMsgTexto = ultimaMsg?.msg || "Nenhuma mensagem";
          const ultimaMsgNick = ultimaMsg?.nick || "Desconhecido";
          const ultimaMsgHora = ultimaMsg?.timestamp
            ? new Date(ultimaMsg.timestamp).toLocaleTimeString()
            : "Indefinido";

          return (
            <div
              key={sala._id}
              className="flex items-center space-x-4 p-5 rounded-xl bg-gray-700 hover:bg-gray-600 cursor-pointer transition duration-200 transform hover:scale-105"
              onClick={() => entrarNaSala(sala._id)}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {sala.nome[0]}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold text-xl">{sala.nome}</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-green-400"></span>
                    <span className="text-white text-sm">{sala.msgs.length}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-300 text-sm">
                    Última mensagem: {ultimaMsgTexto}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {ultimaMsgNick} - {ultimaMsgHora}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
</div>

  
  

  );
}

export default Home;
