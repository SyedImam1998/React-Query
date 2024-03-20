import { useQuery } from "react-query";
import axios from "axios";

const fetchData = (id) => axios.get("http://localhost:4000/superheroes/" + id);
export const useSuperHeroData = (hId) => {
  return useQuery(["super-here", hId], () => fetchData(hId));
};

