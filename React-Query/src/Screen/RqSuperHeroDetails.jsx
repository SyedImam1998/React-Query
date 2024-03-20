import { useParams } from "react-router-dom";
import { useSuperHeroData } from "../Hooks/useSuperHeroData";
import axios from "axios";
import { useQuery } from "react-query";

const fetchData = ({queryKey}) => axios.get("http://localhost:4000/superheroes/" + queryKey[1]);
const RqSuperHeroDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery(["super-here",id], fetchData);

  if (isLoading) {
    return "Loading...";
  }

  return <div>{data.data.name + " is   " + data.data.alterego}</div>;
};

export default RqSuperHeroDetails;
