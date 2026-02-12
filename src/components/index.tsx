import classNames from 'classnames';
import { Col } from 'reactstrap';

function Colxx({ className = '', ...props }) {
  return (
    <Col
      {...props}
      className={className}
    />
  );
}

function Separator({ className = '', style = undefined }) {
  return <div className={classNames(`separator`, className)} style={style} />;
}
export { Colxx, Separator };