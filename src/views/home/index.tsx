import { Clock } from 'lucide-react';
import { Colxx } from '../../components';
import { Row } from 'reactstrap';

function Home() {
  return (
    <>
      <div className="p-5 w-100">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Clock size={30}/>       
          <h2 className='m-0 p-0'>Welcome to Spatium</h2>
        </div>
        <Row className='flex-nowrap'>
          <Colxx xxl="4">
            <div className="card p-2"> Card 1 </div>
          </Colxx>
          <Colxx xxl="4">
            <div className="card p-2"> Card 2 </div>
          </Colxx>
          <Colxx xxl="4">
            <div className="card p-2"> Card 3 </div>
          </Colxx>
        </Row>
      </div>
    </>
  );
}

export default Home;
