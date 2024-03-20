import axios from "axios";
import React from "react";
import {useQuery} from 'react-query';

const fetchSuperHeros=()=>axios.get('http://localhost:4000/superheroes')
const fetchPosts=()=>axios.get('http://localhost:4000/posts')


const ParallelQueryPage = () => {
    const{data:superHeroData}=useQuery('super-heros',fetchSuperHeros)
    const {data:postData,}=useQuery('super-posts',fetchPosts)
  return <div>ParallelQuery.pagP</div>;
};

export default ParallelQueryPage;
    