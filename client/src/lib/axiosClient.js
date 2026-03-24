import axios from 'axios';

// Não precisamos mais definir localhost aqui!
// O navegador vai usar a URL atual automaticamente.
const axiosClient = axios.create({
  baseURL: '/painel-digital-uerj',
});

export default axiosClient;
