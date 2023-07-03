import { useEffect, useState } from "react";
import Layout from "./Components/Layout";
import Link from "next/link";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import { ReactSortable }  from "react-sortablejs";
import Spinner from "./Components/Spinner";

function Categories( {swal} ){
    const [editedCategory, setEditedCategory ] = useState(null);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [properties, setProperties] = useState([]);
    const [isUploading,setIsUploading] = useState(false);
    const [images,setImages] = useState([]);

    useEffect( ()=>{
        fetchCategories();
    },[])
    function fetchCategories(){
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
          });
    }

    async function saveCategory(ev){
        const data = {
            name, 
            parentCategory,
            images, 
            properties: properties.map(p=> ({
                name: p.name, values:
                p.values.split(','),
            }))
        }
        ev.preventDefault();
        if(editedCategory){
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);            
            setEditedCategory(null);

        }else{
            await axios.post('/api/categories', data);
        }
        setParentCategory('');
        setName('');
        setProperties('')
        setImages('')
        fetchCategories();
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
    async function editCategory(category){
        console.log(category)
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id)
    }
    
    async function deleteCategory(category){
        swal.fire({
            title: 'Você tem certeza?',
            text: `Você quer apagar ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sim, apagar',
            confirmButtonColor: '#d55',
            reverseButtons: true,
        }).then( async result =>{
            if(result.isConfirmed){
                const { _id } = category;
                await axios.delete('/api/categories?_id='+ _id);
                fetchCategories();
            }
        })        
    }

    function addProperty(){
        setProperties( prev =>{
            return [...prev, {name:'', values:''}]
        })
    }

    function handlePropertyNameChange(index, property, newName){
        setProperties(prev =>{
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        })
    }

    function handlePropertyValueChange(index, property, newValues){
        setProperties(prev =>{
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        })
    }
    function removeProperty(indexToRemove){
        setProperties(prev =>{
            return [...prev].filter((p,pIndex) =>{
                return pIndex !== indexToRemove;
            });
        });
    }
    return(
        <Layout>
            <h1>Categorias</h1>            
                <label>{ editedCategory
                    ? `Alterar categoria ${editedCategory.name}` 
                    : 'Nome da nova categoria'}
                </label>
                <form onSubmit={ saveCategory }>  
                    <div className="flex gap-1">
                        <input 
                            type="text" 
                            placeholder="Nome da categoria"
                            value={ name }
                            onChange={ event => setName(event.target.value)}
                        />
                        <select 
                            value={ parentCategory || '' }
                            onChange={ ev=> setParentCategory( ev.target.value )}
                        >
                            <option value="">Sem categoria pai</option>
                                {   categories.length > 0 &&
                                    categories.map( category => (
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    ))
                                }
                        </select>                        
                    </div>
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
                                <div className="mb-2"> Sem foto nesta categoria </div>
                            )}
                        </div>
                    <div className="mb-2">
                        <label className="block">Propriedades</label>
                        
                        <button 
                            type="button" 
                            className="btn-default text-sm mb-2"
                            onClick={ addProperty }
                        >
                            Adicionar nova propriedade
                        </button>
                        {
                            properties.length > 0 && properties.map( (property, index) =>(
                                <div className="flex gap-1 mb-2">
                                    <input 
                                        type="text" 
                                        className="mb-0"
                                        value={ property.name }
                                        onChange={ (ev) => handlePropertyNameChange(index, property, ev.target.value)}
                                        placeholder="Nome da propriedade (exemplo: cor)"
                                    />
                                    <input 
                                        type="text" 
                                        className="mb-0"
                                        value={ property.values }
                                        onChange={ (ev) => handlePropertyValueChange(index, property, ev.target.value) }
                                        placeholder="caracteristicas, separadas por virgulas"
                                    />
                                    <button 
                                        className="btn-default"
                                        type="button"
                                        onClick={ () => removeProperty(index) }
                                    >Remover</button>
                                </div>
                            ))
                        }
                    </div>                  
                    {  
                        editedCategory &&(
                            <button 
                                type="button"
                                onClick={ ()=> {
                                    setEditedCategory(null);
                                    setName('');
                                    setParentCategory('');
                                }}
                                className="btn-default"
                            >
                                Cancelar
                            </button>
                        )
                            
                    }
                    <button type="submit" className="btn-primary py-1">Save</button>
                </form>
                { !editedCategory && (
                    <table className="basic mt-2">
                    <thead>
                        <tr>
                            <td>Nome da categoria</td>
                            <td>Categoria pai</td>
                            <td>Ações</td>
                        </tr>
                    </thead>
                    <tbody>
                        {   categories.length > 0 &&
                            categories.map( category => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>{category?.parent?.name}</td>
                                    <td>
                                        <div className="flex justify-around gap-1">
                                            <button 
                                                onClick={ ()=> editCategory(category)}
                                                className="flex items-center btn-primary mr-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                                Editar
                                            </button>
                                            <button 
                                                onClick={ ()=> deleteCategory(category) }
                                                className="flex items-center btn-red"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                                Apagar                                      
                                            </button>
                                        </div>                                        
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>      
                )}
                
        </Layout>
    )
}

export default withSwal(({swal}, ref) => (
    <Categories swal={swal} />
  ));