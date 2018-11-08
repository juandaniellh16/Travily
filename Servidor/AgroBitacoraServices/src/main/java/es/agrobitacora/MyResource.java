
package es.agrobitacora;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import es.agrobitacora.dao.Evento;
import es.agrobitacora.dao.EventoDAO;

/** Example resource class hosted at the URI path "/eventos"
 */
@Path("/eventos")
public class MyResource {
    
    @GET
    @Produces("application/json")
    public List<Evento> getEvento() {
        EventoDAO dao = new EventoDAO();
        List<Evento> Eventos = dao.getEventos();
        return Eventos;
    }
 
    @GET
    @Path("/{id}")
    @Produces("application/json")
    public Evento getEvento(@PathParam("id") int id) {
        EventoDAO dao = new EventoDAO();
        Evento ev = dao.getEvento(id);
        return ev;
    }
    
    @POST
    @Path("/create")
    @Consumes("application/json")
    public Response addEvento(Evento emp){
    	emp.setDetalles(emp.getDetalles());
    	emp.setFecha(emp.getFecha());
    	emp.setFin(emp.getFin());
    	emp.setInicio(emp.getInicio());
    	emp.setNombre(emp.getNombre());
    	emp.setResponsables(emp.getResponsables());
                
        EventoDAO dao = new EventoDAO();
        dao.addEvento(emp);
        
        return Response.ok().build();
    }
    
    @PUT
    @Path("/update/{id}")
    @Consumes("application/json")
    public Response updateEvento(@PathParam("id") int id, Evento emp){
        EventoDAO dao = new EventoDAO();
        int count = dao.updateEvento(id, emp);
        if(count==0){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok().build();
    }
    
    @DELETE
    @Path("/delete/{id}")
    @Consumes("application/json")
    public Response deleteEvento(@PathParam("id") int id){
        EventoDAO dao = new EventoDAO();
        int count = dao.deleteEvento(id);
        if(count==0){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok().build();
    }
}
