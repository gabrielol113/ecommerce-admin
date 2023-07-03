import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./Layout";
import axios from "axios";
import Spinner from "./Spinner";
import { ReactSortable }  from "react-sortablejs";

export default function ProductForm({  _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images:existingImages,
    category:assignedCategory,
    properties:assignedProperties,
}) {
    const [title,setTitle] = useState(existingTitle || '');
    const [description,setDescription] = useState(existingDescription || '');
    const [category,setCategory] = useState(assignedCategory || '');
    const [productProperties,setProductProperties] = useState(assignedProperties || {});
    const [price,setPrice] = useState(existingPrice || '');
    const [images,setImages] = useState(existingImages || []);
    const [goToProducts,setGoToProducts] = useState(false);
    const [isUploading,setIsUploading] = useState(false);
    const [categories,setCategories] = useState([]);
    const router = useRouter();

        useEffect( ()=>{
            axios.get('/api/categories').then( result =>{
                setCategories(result.data);
            })
        },[]);

    async function saveProduct(ev){        
        ev.preventDefault();
        const data={title,description,price, images, category, properties:productProperties};

        if(_id){
            await axios.put('/api/products',{...data,_id});
        }else{
            await axios.post('/api/products', data);            
        }
        setGoToProducts(true);
    }
    if(goToProducts){
        router.push('/products');
    }
    async function uploadImages(ev){
        const files = ev.target?.files;
        if(files?.length > 0){
            setIsUploading(true);
            const data = new FormData();

            for(const file of files){
                data.append('file', file);
            }
            const res = await axios.post('/api/upload', data, {
                headers:{'Content-Type': 'multiparty/form-data'},
            });
            setImages( oldImages => {
                return [...oldImages, ...res.data.links];
            })
            setIsUploading(false);
        }
    }
    function updateImagesOrder(images){
        setImages(images);
    }

    function setProductProp(propName, value){
        setProductProperties( prev =>{
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps;
        });
    }
    const propertiesToFill = [];

    if(categories.length > 0 && category){
        let CatInfo = categories.find( ({_id}) => _id === category)
        propertiesToFill.push(...CatInfo.properties);
        while(CatInfo?.parent?._id){
            const parentCat = categories.find( ({_id}) => _id === CatInfo?.parent?._id)
            propertiesToFill.push(...parentCat.properties);
            CatInfo = parentCat;
        }
    }


    return(
        <form onSubmit={ saveProduct }>
            <label>Nome do Produto</label>
            <input 
                type="text" 
                placeholder="Nome do Produto"
                value={ title }
                onChange={ (ev) => setTitle( ev.target.value )}
            />
            <label>Categoria do Produto</label>

            <select 
                value={category} 
                onChange={ev => setCategory(ev.target.value)}
            >
                <option value=""> Sem Categoria </option>
                {
                    categories.length > 0 && categories.map( c=> (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))
                }
            </select>

            {   propertiesToFill.length > 0 && propertiesToFill.map(p => (
                <div key={p.name} className="flex flex-col gap-1">
                    <div>{p.name[0].toUpperCase()+p.name.substring(1)}</div>
                    <select 
                        key={p.name}
                        value={productProperties[p.name]}
                        onChange={ ev => { console.log(productProperties); setProductProp( p.name, ev.target.value )}}
                    >
                        { p.values.map( v=> (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>
            ))
            

            }

            <label>Fotos</label>
            <div className="mb-2 flex flex-wrap gap-1">
                
                    <ReactSortable 
                        list={images} 
                        className="flex flex-wrap gap-1"
                        setList={ updateImagesOrder }
                    >
                        {
                           !!images?.length > 0 && images.map( link => (
                                <div key={link} className=" h-24">
                                    {<img src={link} className="rounded-lg" alt="Photos"></img>}
                                </div>
                            ))
                        }
                    </ReactSortable>
                 
                
                { isUploading && (
                    <div className="h-24 flex items-center">
                        <Spinner/>
                    </div>
                )}
                <label className="cursor-pointer w-24 h-24 flex flex-col items-center text-sm justify-center bg-gray-200 rounded-lg text-gray-500">
                    Upload
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <input type="file" className="hidden" onChange={ uploadImages }/>
                </label>
                {!images?.length && (
                    <div className="mb-2"> Sem fotos neste produto </div>
                )}
            </div>
            <label>Descrição</label>
            <textarea 
                placeholder="Descrição"
                value={ description }
                onChange={ (ev) => setDescription( ev.target.value )}
            />
            <label>Preço (em Euros)</label>
            <input 
                type="number" 
                placeholder="price"
                value={ price }
                onChange={ (ev) => setPrice( ev.target.value )}
            />
            <button 
                type="submit"
                className="btn-primary"
            >Save</button>
        </form>            
    )
}