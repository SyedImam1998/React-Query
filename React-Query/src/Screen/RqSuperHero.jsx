import React from "react";
import axios from "axios";
import { useQuery } from "react-query";

const fetchData=()=>{
    return axios.get("http://localhost:4000/superheroes");
}
const RqSuperHero = () => {  
  const { isLoading, data, isError,error } = useQuery("super-heros", fetchData,{staleTime:5000});

  if (isLoading) {
    return "Loading";
  }
  if(isError){
    return error.message;
  }
  return (
    <div>
      {data?.data.map((item) => {
        return <li key={item.id}>{item.name}</li>;
      })}
    </div>
  );
};

export default RqSuperHero;
