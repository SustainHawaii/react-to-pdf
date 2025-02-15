import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import JsPdf from 'jspdf';
import html2canvas from 'html2canvas';

const IMAGE_FORMATS = ['png', 'jpeg'];

class ReactToPdf extends PureComponent {
  constructor(props) {
    super(props);
    this.toPdf = this.toPdf.bind(this);
    this.targetRef = React.createRef();
  }

  toPdf() {
    const { targetRef, filename, x, y, options, onComplete, imageFormat } = this.props;
    const source = targetRef || this.targetRef;
    const targetComponent = source.current || source;
    if (!targetComponent) {
      throw new Error(
        'Target ref must be used or informed. See https://github.com/ivmarcos/react-to-pdf#usage.'
      );
    }
    if (!IMAGE_FORMATS.includes(imageFormat)) {
      throw new Error(`Invalid image format. Use ${IMAGE_FORMATS.join(', ')}`);
    }
    html2canvas(targetComponent, {
      logging: false,
      useCORS: true,
      scale: this.props.scale
    }).then(canvas => {
      const imgData = canvas.toDataURL(`image/${imageFormat}`);
      const pdf = new JsPdf(options);
      pdf.addImage(imgData, imageFormat.toUpperCase(), x, y);
      pdf.save(filename);
      if (onComplete) onComplete();
    });
  }

  render() {
    const { children } = this.props;
    return children({ toPdf: this.toPdf, targetRef: this.targetRef });
  }
}

ReactToPdf.propTypes = {
  filename: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  options: PropTypes.shape({}),
  scale: PropTypes.number,
  children: PropTypes.func.isRequired,
  onComplete: PropTypes.func,
  imageFormat: PropTypes.string,
  targetRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

ReactToPdf.defaultProps = {
  filename: 'download.pdf',
  options: undefined,
  x: 0,
  y: 0,
  scale: 1,
  onComplete: undefined,
  imageFormat: 'jpeg',
  targetRef: undefined
};

export default ReactToPdf;
