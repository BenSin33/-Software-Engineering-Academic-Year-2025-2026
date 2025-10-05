import { Footer } from "./Footer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";



export function Layout({list,children}:any){
    return(
        <>
        <div className="grid grid-cols-[200px_1fr] grid-rows-[50px_1fr_50px] w-screen h-screen">
        <div className="row-start-1 row-end-2 col-start-1 col-end-3">
            <Header></Header>
        </div>
        <div className="col-start-1 col-end-2 row-start-2 row-end-3">
            <Sidebar list={list}/>
        </div>
        <div className="col-start-2 col-end-3 row-start-2 row-end-3">
        {children}
        </div>
        <div className="col-start-1 col-end-3 row-start-3 row-end-4">
            <Footer/>
        </div>
     </div>
        </>
    )
}