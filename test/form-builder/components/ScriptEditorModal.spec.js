import React from 'react';
import { mount } from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
import chai, { expect } from 'chai';
import ScriptEditorModal from '../../../src/form-builder/components/ScriptEditorModal';
import sinon from 'sinon';
import { commonConstants } from 'common/constants';
import CodeMirror from 'codemirror';
import jsBeautifier from 'js-beautify';

chai.use(chaiEnzyme());

describe('ScriptEditorModal', () => {
  let wrapper;
  let updateScriptSpy;
  let closeSpy;
  let codeMirrorStub;
  let beautifierStub;
  let formatStub;

  beforeEach(() => {
    updateScriptSpy = sinon.spy();
    closeSpy = sinon.spy();
  });

  afterEach(() => {
    if (codeMirrorStub) {
      codeMirrorStub.restore();
    }
    if (beautifierStub) {
      beautifierStub.restore();
    }
    if (formatStub) {
      formatStub.restore();
    }
  });

  it('should render editor modal', () => {
    wrapper = mount(
      <ScriptEditorModal
        close={closeSpy}
        updateScript={updateScriptSpy}
      />);
    expect(wrapper.find('.editor-wrapper')).to.have.length(1);
    expect(wrapper.find('.script-editor-button-wrapper')).to.have.length(1);
  });

  it('should call close once click cancel button', () => {
    wrapper = mount(
      <ScriptEditorModal
        close={closeSpy}
        updateScript={updateScriptSpy}
      />);
    const cancelButton = wrapper.find('.btn').at(1);
    cancelButton.simulate('click');

    expect(cancelButton.text()).to.eql('Cancel');
    sinon.assert.calledOnce(closeSpy);
  });

  it('should call update script once click save button', () => {
    const script = 'function(){var x = 10;}';
    formatStub = sinon.stub(ScriptEditorModal.prototype, 'format').callsFake(() => {});
    codeMirrorStub = sinon.stub(CodeMirror, 'fromTextArea')
      .callsFake(() => ({ getValue() {return script;} }));
    wrapper = mount(
      <ScriptEditorModal
        close={closeSpy}
        updateScript={updateScriptSpy}
      />);

    const saveButton = wrapper.find('.button');
    saveButton.simulate('click');

    expect(saveButton.text()).to.eql('Save');
    sinon.assert.calledOnce(updateScriptSpy);
  });

  it('should throw error and show notification for sometime if script is invalid', () => {
    const script = 'random value';
    codeMirrorStub = sinon.stub(CodeMirror, 'fromTextArea')
      .callsFake(() => ({ getValue() {return script;} }));
    wrapper = mount(
      <ScriptEditorModal
        close={closeSpy}
        updateScript={updateScriptSpy}
      />);
    const clock = sinon.useFakeTimers();
    const expectedErrorMessage = 'Please Enter valid javascript function';
    commonConstants.toastTimeout = 1000;

    const saveButton = wrapper.find('.button');
    saveButton.simulate('click');
    expect(wrapper.state().notification).to.eql({ type: 'error', message: expectedErrorMessage });
    expect(wrapper.find('.notification--error').text()).to.eql(expectedErrorMessage);

    clock.tick(commonConstants.toastTimeout);
    expect(wrapper.state().notification).to.eql({});
  });

  it('should trim extra spaces in the script and save', () => {
    const script = '        ';
    formatStub = sinon.stub(ScriptEditorModal.prototype, 'format').callsFake(() => {});
    codeMirrorStub = sinon.stub(CodeMirror, 'fromTextArea')
      .callsFake(() => ({ getValue() {return script;} }));
    wrapper = mount(
      <ScriptEditorModal
        close={closeSpy}
        updateScript={updateScriptSpy}
      />);

    const saveButton = wrapper.find('.button');
    saveButton.simulate('click');

    sinon.assert.calledOnce(updateScriptSpy);
  });

  it('should call js_beautify on click of format', () => {
    const script = 'function(){var x = 10;}';
    beautifierStub = sinon.stub(jsBeautifier, 'js_beautify').callsFake(() => '');
    codeMirrorStub = sinon.stub(CodeMirror, 'fromTextArea')
      .callsFake(() => ({ getValue() {return script;}, setValue() {} }));
    wrapper = mount(
      <ScriptEditorModal
        close={closeSpy}
        updateScript={updateScriptSpy}
      />);
    const saveButton = wrapper.find('.btn').at(0);
    saveButton.simulate('click');
    sinon.assert.calledOnce(beautifierStub);
  });
});
