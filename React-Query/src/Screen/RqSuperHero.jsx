import React from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

const fetchData = () => {
  return axios.get("http://localhost:4000/superheroes");
};
const RqSuperHero = () => {
  const onSuccess = (data) => {
    console.log("success perform side kick",data);
  };
  const onError = (error) => {
    console.log("Error perform side kick",error);
  };

  const { isLoading, data, isError, error, refetch } = useQuery(
    "super-heros",
    fetchData,
    { onSuccess, onError}
  );

  if (isLoading) {
    return "Loading";
  }
  if (isError) {
    return error.message;
  }
  return (
    <div>
      {data?.data.map((item) => {
        return <li key={item.id}><Link to={`/rq-superhero/${item.id}`}>{item.name}</Link></li>;
      })}
      <br></br>
      <button onClick={refetch}>Refetch Data</button>
    </div>
  );
};

export default RqSuperHero;
