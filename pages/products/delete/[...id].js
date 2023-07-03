import Layout from "@/pages/Components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
export default function DeleteProductPage(){
    const router = useRouter();
    const { id } = router.query;
    const [productInfo, setProductInfo] = useState('');

    useEffect( ()=> {
        if(!id){
            return;
        }
        axios.get('/api/products?id='+id).then( response =>{
            setProductInfo(response.data);
            console.log(productInfo);
        })
    },[id])
    function goBack(){
        router.push('/products');
    }
    async function deleteProduct(){
        await axios.delete('/api/products?id='+id);
        goBack();
    }
    return(
        <Layout>
            <h1 className="text-center">Você quer realmente deletar o produto&nbsp;"{productInfo?.title}"?</h1>
            <div className="flex gap-2 justify-center">
                <button 
                    className="btn-red"
                    onClick={ deleteProduct }
                >Sim
                </button>
                <button 
                    className="btn-default" 
                    onClick={ goBack }
                >Não
                </button>
            </div>

        </Layout>
    )

}